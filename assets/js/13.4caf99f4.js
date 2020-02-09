(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{218:function(e,t,s){"use strict";s.r(t);var a=s(3),r=Object(a.a)({},(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"grid-eye"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#grid-eye"}},[e._v("#")]),e._v(" Grid-EYE")]),e._v(" "),s("p",[s("strong",[e._v("Integration Key:")]),e._v(" "),s("code",[e._v("gridEye")])]),e._v(" "),s("p",[e._v("The Grid-EYE sensor by Panasonic is a thermopile sensor that can be used to measure a 64x64 matrix of temperatures in front of its lense. This data can be used to detect human presence in the room, even if the person is stationary. This is done by analyzing the temperature readings for localized peaks, i.e. certain spots have a notably higher temperature than the rest. SparkFun sells a "),s("a",{attrs:{href:"https://www.sparkfun.com/products/14607",target:"_blank",rel:"noopener noreferrer"}},[e._v("version of the sensor"),s("OutboundLink")],1),e._v(" that can be easily connected to Linux boards and will also work with this component.")]),e._v(" "),s("p",[e._v("This integration will provide a sensor that contains a count of people in the room. It also includes their coordinates (relative to the sensor view) in the sensor attributes.")]),e._v(" "),s("h2",{attrs:{id:"requirements"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#requirements"}},[e._v("#")]),e._v(" Requirements")]),e._v(" "),s("p",[e._v("The sensor needs to be connected to the I"),s("sup",[e._v("2")]),e._v("C pins on your machine. For Raspberry Pi devices the I"),s("sup",[e._v("2")]),e._v("C interface also needs to be enabled using "),s("code",[e._v("sudo raspi-config")]),e._v(" and then enabling the I"),s("sup",[e._v("2")]),e._v("C option under Advanced Options.")]),e._v(" "),s("h2",{attrs:{id:"sensor-placement"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#sensor-placement"}},[e._v("#")]),e._v(" Sensor placement")]),e._v(" "),s("p",[e._v("When placing your sensor you need to consider a few factors to get reliable results:")]),e._v(" "),s("ul",[s("li",[e._v("Don't face the sensor towards a source of heat that is less than 5 meters away, for example radiators or windows.")]),e._v(" "),s("li",[e._v("Make sure the sensor has a clear view of all areas that you want to track.")]),e._v(" "),s("li",[e._v("Consider the range of the sensor, the further away people are the harder it will be to reliably detect them.")]),e._v(" "),s("li",[e._v("Consider the field of view as stated in the datasheet.")])]),e._v(" "),s("h2",{attrs:{id:"settings"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#settings"}},[e._v("#")]),e._v(" Settings")]),e._v(" "),s("table",[s("thead",[s("tr",[s("th",[e._v("Name")]),e._v(" "),s("th",[e._v("Type")]),e._v(" "),s("th",[e._v("Default")]),e._v(" "),s("th",[e._v("Description")])])]),e._v(" "),s("tbody",[s("tr",[s("td",[s("code",[e._v("busNumber")])]),e._v(" "),s("td",[e._v("Number")]),e._v(" "),s("td",[s("code",[e._v("1")])]),e._v(" "),s("td",[e._v("I"),s("sup",[e._v("2")]),e._v("C bus number of your machine that the sensor is connected to.")])]),e._v(" "),s("tr",[s("td",[s("code",[e._v("address")])]),e._v(" "),s("td",[e._v("Number")]),e._v(" "),s("td",[s("code",[e._v("0x69")])]),e._v(" "),s("td",[e._v("I"),s("sup",[e._v("2")]),e._v("C address of the D6T sensor that you want to use.")])]),e._v(" "),s("tr",[s("td",[s("code",[e._v("deltaThreshold")])]),e._v(" "),s("td",[e._v("Number")]),e._v(" "),s("td",[s("code",[e._v("2")])]),e._v(" "),s("td",[e._v("Minimum temperature difference between average and single temperature pixel in °C for it to be considered as human presence. Increase if you are seeing false positives, decrease if you are seeing false negatives.")])])])]),e._v(" "),s("details",{staticClass:"custom-block details"},[s("summary",[e._v("Example Config")]),e._v(" "),s("div",{staticClass:"language-yaml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-yaml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token key atrule"}},[e._v("global")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v("\n  "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[e._v("integrations")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("-")]),e._v(" gridEye\n"),s("span",{pre:!0,attrs:{class:"token key atrule"}},[e._v("gridEye")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v("\n  "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[e._v("deltaThreshold")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("2")]),e._v("\n")])])])])])}),[],!1,null,null,null);t.default=r.exports}}]);