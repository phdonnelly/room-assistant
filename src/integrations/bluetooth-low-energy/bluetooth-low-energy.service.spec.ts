import KalmanFilter from 'kalmanjs';

const mockNoble = {
  on: jest.fn()
};
jest.mock(
  '@abandonware/noble',
  () => {
    return mockNoble;
  },
  { virtual: true }
);
jest.mock('kalmanjs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      filter: (z: number): number => z
    };
  });
});

import { Peripheral } from '@abandonware/noble';
import { ConfigService } from '../../config/config.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BluetoothLowEnergyService,
  NEW_DISTANCE_CHANNEL
} from './bluetooth-low-energy.service';
import { EntitiesModule } from '../../entities/entities.module';
import { ConfigModule } from '../../config/config.module';
import { ClusterModule } from '../../cluster/cluster.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClusterService } from '../../cluster/cluster.service';
import { EntitiesService } from '../../entities/entities.service';
import { BluetoothLowEnergyConfig } from './bluetooth-low-energy.config';
import { Sensor } from '../../entities/sensor.entity';
import c from 'config';
import { NewDistanceEvent } from './new-distance.event';
import { RoomPresenceDistanceSensor } from '../room-presence/room-presence-distance.sensor';

describe('BluetoothLowEnergyService', () => {
  let service: BluetoothLowEnergyService;
  const clusterService = {
    on: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn()
  };
  const entitiesService = {
    has: jest.fn(),
    get: jest.fn(),
    add: jest.fn()
  };
  let mockConfig: Partial<BluetoothLowEnergyConfig> = {
    tagOverrides: {}
  };
  const configService = {
    get: jest.fn().mockImplementation((key: string) => {
      return key === 'bluetoothLowEnergy' ? mockConfig : c.get(key);
    })
  };

  const iBeaconData = Buffer.from([
    76,
    0,
    2,
    21,
    47,
    35,
    68,
    84,
    207,
    109,
    74,
    15,
    173,
    242,
    244,
    145,
    27,
    169,
    255,
    166,
    0,
    1,
    0,
    2,
    204
  ]);

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfig = { tagOverrides: {} };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        ClusterModule,
        EntitiesModule,
        ScheduleModule.forRoot()
      ],
      providers: [BluetoothLowEnergyService]
    })
      .overrideProvider(ClusterService)
      .useValue(clusterService)
      .overrideProvider(EntitiesService)
      .useValue(entitiesService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    service = module.get<BluetoothLowEnergyService>(BluetoothLowEnergyService);
  });

  it('should setup noble listeners on init', () => {
    service.onModuleInit();
    expect(mockNoble.on).toHaveBeenCalledWith(
      'stateChange',
      expect.any(Function)
    );
    expect(mockNoble.on).toHaveBeenCalledWith('discover', expect.any(Function));
  });

  it('should setup cluster listeners on bootstrap', () => {
    service.onApplicationBootstrap();
    expect(clusterService.on).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expect.any(Function)
    );
    expect(clusterService.subscribe).toHaveBeenCalledWith(NEW_DISTANCE_CHANNEL);
  });

  it('should detect iBeacons based on their manufacturer data', () => {
    expect(service.isIBeacon(iBeaconData)).toBeTruthy();
    expect(service.isIBeacon(Buffer.from([123, 12, 51, 6]))).toBeFalsy();
  });

  it('should ignore tags that are not iBeacons if only those should be processed', () => {
    mockConfig.processIBeacon = true;
    mockConfig.onlyIBeacon = true;

    service.handleDiscovery({
      advertisement: {
        manufacturerData: Buffer.from([1, 2, 3])
      }
    } as Peripheral);
    expect(clusterService.publish).not.toHaveBeenCalled();
  });

  it('should publish iBeacon distance changes', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    const handleDistanceSpy = jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);

    mockConfig.onlyIBeacon = true;
    mockConfig.processIBeacon = true;

    service.handleDiscovery({
      id: 'abcd1234',
      rssi: -50,
      advertisement: {
        localName: 'Test Beacon',
        txPowerLevel: -72,
        manufacturerData: iBeaconData
      }
    } as Peripheral);

    const expectedEvent = new NewDistanceEvent(
      'test-instance',
      '2f234454cf6d4a0fadf2f4911ba9ffa6-1-2',
      'Test Beacon',
      0.7
    );
    expect(sensor.state).toBe(0.7);
    expect(handleDistanceSpy).toHaveBeenCalledWith(expectedEvent);
    expect(clusterService.publish).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expectedEvent
    );
  });

  it('should not process iBeacon data if disabled in the config', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    const handleDistanceSpy = jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);

    mockConfig.processIBeacon = false;
    service.handleDiscovery({
      id: 'abcd1234',
      rssi: -59,
      advertisement: {
        localName: 'Test Beacon',
        txPowerLevel: -59,
        manufacturerData: iBeaconData
      }
    } as Peripheral);

    const expectedEvent = new NewDistanceEvent(
      'test-instance',
      'abcd1234',
      'Test Beacon',
      1
    );
    expect(sensor.state).toBe(1);
    expect(handleDistanceSpy).toHaveBeenCalledWith(expectedEvent);
    expect(clusterService.publish).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expectedEvent
    );
  });

  it('should publish distance changes for normal BLE devices', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    const handleDistanceSpy = jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);

    service.handleDiscovery({
      id: '123-123',
      rssi: -81,
      advertisement: {
        localName: 'Test BLE Device'
      }
    } as Peripheral);

    const expectedEvent = new NewDistanceEvent(
      'test-instance',
      '123-123',
      'Test BLE Device',
      10.5
    );
    expect(sensor.state).toBe(10.5);
    expect(handleDistanceSpy).toHaveBeenCalledWith(expectedEvent);
    expect(clusterService.publish).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expectedEvent
    );
  });

  it('should apply tag overrides if they exist', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    const handleDistanceSpy = jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);
    mockConfig.tagOverrides = {
      abcd: {
        measuredPower: -80
      }
    };

    service.handleDiscovery({
      id: 'abcd',
      rssi: -81,
      advertisement: {
        localName: 'Test BLE Device'
      }
    } as Peripheral);

    const expectedEvent = new NewDistanceEvent(
      'test-instance',
      'abcd',
      'Test BLE Device',
      1.1
    );
    expect(sensor.state).toBe(1.1);
    expect(handleDistanceSpy).toHaveBeenCalledWith(expectedEvent);
    expect(clusterService.publish).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expectedEvent
    );

    service.handleDiscovery({
      id: 'defg',
      rssi: -81,
      advertisement: {
        localName: 'Test BLE Device'
      }
    } as Peripheral);

    expectedEvent.tagId = 'defg';
    expectedEvent.distance = 10.5;
    expect(sensor.state).toBe(10.5);
    expect(handleDistanceSpy).toHaveBeenCalledWith(expectedEvent);
    expect(clusterService.publish).toHaveBeenCalledWith(
      NEW_DISTANCE_CHANNEL,
      expectedEvent
    );
  });

  it('should create a new distance sensor if there is not a matching one yet', () => {
    const sensor = new Sensor('new', 'New');
    entitiesService.has.mockReturnValue(false);
    entitiesService.add.mockReturnValue(sensor);
    jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);

    service.handleDiscovery({
      id: 'abcd',
      rssi: -60,
      advertisement: {
        localName: 'Test BLE Device'
      }
    } as Peripheral);

    expect(entitiesService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ble-abcd',
        name: 'Distance test-instance - Test BLE Device'
      }),
      expect.any(Array)
    );
    expect(sensor.state).toBe(1.1);
  });

  it('should not publish state changes for devices that are not on the whitelist', () => {
    jest.spyOn(service, 'isOnWhitelist').mockReturnValue(false);

    service.handleDiscovery({
      id: 'abcd',
      rssi: -30,
      advertisement: {}
    } as Peripheral);

    expect(entitiesService.has).not.toHaveBeenCalled();
    expect(clusterService.publish).not.toHaveBeenCalled();
  });

  it('should match ids to a normal whitelist', () => {
    mockConfig.whitelist = ['vip-id', 'vip2-id'];

    expect(service.isOnWhitelist('vip-id')).toBeTruthy();
    expect(service.isOnWhitelist('random-id')).toBeFalsy();
  });

  it('should match ids to a regex whitelist', () => {
    mockConfig.whitelist = ['vip-[a-z]+', '^[1-9]+$'];
    mockConfig.whitelistRegex = true;

    expect(service.isOnWhitelist('vip-def')).toBeTruthy();
    expect(service.isOnWhitelist('asvip-abcd')).toBeTruthy();
    expect(service.isOnWhitelist('123')).toBeTruthy();
    expect(service.isOnWhitelist('test')).toBeFalsy();
    expect(service.isOnWhitelist('test123')).toBeFalsy();
  });

  it('should filter the measured RSSI of the peripherals', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);
    const filterSpy = jest.spyOn(service, 'filterRssi').mockReturnValue(-50);

    service.handleDiscovery({
      id: '12:ab:cd:12:cd',
      rssi: -45,
      advertisement: {
        localName: 'Test BLE Device'
      }
    } as Peripheral);

    expect(filterSpy).toHaveBeenCalledWith('12:ab:cd:12:cd', -45);
    expect(sensor.state).toBe(0.2);
  });

  it('should reuse existing Kalman filters for the same id', () => {
    const sensor = new Sensor('testid', 'Test');
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    jest
      .spyOn(service, 'handleNewDistance')
      .mockImplementation(() => undefined);

    service.handleDiscovery({
      id: 'id1',
      rssi: -45,
      advertisement: {}
    } as Peripheral);
    service.handleDiscovery({
      id: 'id2',
      rssi: -67,
      advertisement: {}
    } as Peripheral);
    service.handleDiscovery({
      id: 'id1',
      rssi: -56,
      advertisement: {}
    } as Peripheral);

    expect(KalmanFilter).toHaveBeenCalledTimes(2);
  });

  it('should pass distance information to existing room presence sensors', () => {
    const sensor = new RoomPresenceDistanceSensor('test', 'Test', 0);
    entitiesService.has.mockReturnValue(true);
    entitiesService.get.mockReturnValue(sensor);
    const sensorHandleSpy = jest.spyOn(sensor, 'handleNewDistance');

    service.handleNewDistance(
      new NewDistanceEvent('test-instance', 'test', 'Test', 2)
    );

    expect(sensorHandleSpy).toHaveBeenCalledWith('test-instance', 2);
  });

  it('should add new room presence sensor if no matching ones exist yet', () => {
    jest.useFakeTimers();
    const sensor = new RoomPresenceDistanceSensor('test', 'Test', 0);
    entitiesService.has.mockReturnValue(false);
    entitiesService.add.mockReturnValue(sensor);
    mockConfig.timeout = 20;
    const sensorHandleSpy = jest.spyOn(sensor, 'handleNewDistance');

    service.handleNewDistance(
      new NewDistanceEvent('test-instance', 'new', 'New Tag', 1.3)
    );

    expect(entitiesService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ble-new-room-presence',
        name: 'New Tag Room Presence',
        timeout: 20
      }),
      expect.any(Array)
    );
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 20 * 1000);
    expect(sensorHandleSpy).toHaveBeenCalledWith('test-instance', 1.3);
  });
});
