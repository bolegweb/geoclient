// Geocoder Nominatim for OpenLayers 3.
// https://github.com/jonataswalker/ol3-geocoder
// Version: v1.5.1
// Built: 2016-01-22T15:41:29-0200

(function (e, t) {
	"use strict";
	this.Geocoder = function () {
		var s = function (e, t) {
			r.assert("string" == typeof e, "@param `control_type` should be string type!"),
			r.assert("object" == typeof t || "undefined" == typeof t, "@param `opt_options` should be object|undefined type!"),
			e = e || "nominatim";
			var o = new s.Nominatim(this, t);
			this.layer = o.layer,
			ol.control.Control.call(this, {
				element : o.els.container
			})
		};
		return ol.inherits(s, ol.control.Control),
		s.prototype.getSource = function () {
			return this.layer.getSource()
		},
		s.prototype.getLayer = function () {
			return this.layer
		},
		function (t) {
			t.Nominatim = function (e, s) {
				this.geocoder = e,
				this.layer_name = r.randomId("geocoder-layer-"),
				this.layer = new ol.layer.Vector({
						name : this.layer_name,
						source : new ol.source.Vector
					});
				var o = {
					provider : "osm",
					placeholder : "Search for an address",
					featureStyle : t.Nominatim.featureStyle,
					lang : "en-US",
					limit : 5,
					keepOpen : !1,
					debug : !1
				};
				return this.options = r.mergeOptions(o, s),
				this.options.provider = this.options.provider.toLowerCase(),
				this.constants = {
					road : "ol-geocoder-road",
					city : "ol-geocoder-city",
					country : "ol-geocoder-country",
					class_container : "ol-geocoder",
					expanded_class : "ol-geocoder-search-expanded"
				},
				this.createControl(),
				this.els = t.Nominatim.elements,
				this.registered_listeners = {
					map_click : !1
				},
				this.setListeners(),
				this
			},
			t.Nominatim.prototype = {
				createControl : function () {
					var e = r.createElement(["div", {
									classname : this.constants.class_container
								}
							], t.Nominatim.html);
					return t.Nominatim.elements = {
						container : e,
						control : e.querySelector(".ol-geocoder-search"),
						btn_search : e.querySelector(".ol-geocoder-btn-search"),
						input_search : e.querySelector(".ol-geocoder-input-search"),
						result_container : e.querySelector(".ol-geocoder-result")
					},
					t.Nominatim.elements.input_search.placeholder = this.options.placeholder,
					e
				},
				setListeners : function () {
					var e = this,
					t = function () {
						r.hasClass(e.els.control, e.constants.expanded_class) ? e.collapse() : e.expand()
					},
					s = function (t) {
						if (13 == t.keyCode) {
							var s = r.htmlEscape(e.els.input_search.value);
							e.query(s)
						}
					};
					e.els.input_search.addEventListener("keydown", s, !1),
					e.els.btn_search.addEventListener("click", t, !1)
				},
				listenMapClick : function () {
					if (!this.registered_listeners.map_click) {
						var e = this,
						t = this.geocoder.getMap().getTargetElement();
						this.registered_listeners.map_click = !0,
						t.addEventListener("click", {
							handleEvent : function (r) {
								e.clearResults(!0),
								t.removeEventListener(r.type, this, !1),
								e.registered_listeners.map_click = !1
							}
						}, !1)
					}
				},
				expand : function () {
					r.removeClass(this.els.input_search, "ol-geocoder-loading"),
					r.addClass(this.els.control, this.constants.expanded_class);
					var t = this.els.input_search;
					e.setTimeout(function () {
						t.focus()
					}, 100),
					this.listenMapClick()
				},
				collapse : function () {
					this.els.input_search.value = "",
					this.els.input_search.blur(),
					r.removeClass(this.els.control, this.constants.expanded_class),
					this.clearResults()
				},
				clearResults : function (e) {
					e ? this.collapse() : r.removeAllChildren(this.els.result_container)
				},
				query : function (e) {
					var s = this,
					o = this.options,
					n = this.els.input_search,
					a = t.Nominatim.providers.names,
					i = this.getProvider({
							provider : o.provider,
							key : o.key,
							query : e,
							lang : o.lang,
							limit : o.limit
						});
					this.clearResults(),
					r.addClass(n, "ol-geocoder-loading"),
					r.json(i.url, i.params).when({
						ready : function (e) {
							o.debug && console.info(e),
							r.removeClass(n, "ol-geocoder-loading");
							var t;
							switch (s.options.provider) {
							case a.OSM:
							case a.MAPQUEST:
								t = e.length > 0 ? s.mapquestResponse(e) : void 0;
								break;
							case a.PELIAS:
								t = e.features.length > 0 ? s.peliasResponse(e.features) : void 0;
								break;
							case a.PHOTON:
								t = e.features.length > 0 ? s.photonResponse(e.features) : void 0;
								break;
							case a.GOOGLE:
								t = e.results.length > 0 ? s.googleResponse(e.results) : void 0
							}
							t && (s.createList(t), s.listenMapClick())
						},
						error : function () {
							r.removeClass(n, "ol-geocoder-loading");
							var e = r.createElement("li", "<h5>Error! No internet connection?</h5>");
							s.els.result_container.appendChild(e)
						}
					})
				},
				createList : function (e) {
					var t = this,
					s = this.els.result_container;
					e.forEach(function (e) {
						var o = t.addressTemplate(e),
						n = '<a href="#">' + o + "</a>",
						a = r.createElement("li", n);
						a.addEventListener("click", function (r) {
							r.preventDefault(),
							t.chosen(e, o, e.address, e.original)
						}, !1),
						s.appendChild(a)
					})
				},
				addressTemplate : function (e) {
					var t = e.address,
					s = [];
					return t.name && s.push('<span class="' + this.constants.road + '">{name}</span>'),
					(t.road || t.building || t.house_number) && s.push('<span class="' + this.constants.road + '">{building} {road} {house_number}</span>'),
					(t.city || t.town || t.village) && s.push('<span class="' + this.constants.city + '">{postcode} {city} {town} {village}</span>'),
					(t.state || t.country) && s.push('<span class="' + this.constants.country + '">{state} {country}</span>'),
					r.template(s.join("<br>"), t)
				},
				chosen : function (e, t, s, o) {
					this.options.keepOpen === !1 && this.clearResults(!0);
					var n = this.geocoder.getMap(),
					a = r.to3857([e.lon, e.lat]),
					i = 2.388657133911758,
					l = 500,
					c = {
						coord : a,
						address_html : t,
						address_obj : s,
						address_original : o
					},
					d = ol.animation.pan({
							duration : l,
							source : n.getView().getCenter()
						}),
					u = ol.animation.zoom({
							duration : l,
							resolution : n.getView().getResolution()
						});
					n.beforeRender(d, u),
					n.getView().setCenter(a),
					n.getView().setResolution(i),
					this.createFeature(c)
				},
				createFeature : function (e) {
					var s = new ol.Feature({
							address_html : e.address_html,
							address_obj : e.address_obj,
							address_original : e.address_original,
							geometry : new ol.geom.Point(e.coord)
						}),
					o = r.randomId("geocoder-ft-"),
					n = this.options.featureStyle || t.Nominatim.featureStyle;
					this.addLayer(),
					s.setStyle(n),
					s.setId(o),
					this.getSource().addFeature(s),
					this.geocoder.dispatchEvent({
						type : t.EventType.ADDRESSCHOSEN,
						feature : s,
						coordinate : e.coord
					})
				},
				mapquestResponse : function (e) {
					var t = e.map(function (e) {
							return {
								lon : e.lon,
								lat : e.lat,
								address : {
									name : e.address.neighbourhood || "",
									road : e.address.road || "",
									postcode : e.address.postcode,
									city : e.address.city || e.address.town,
									state : e.address.state,
									country : e.address.country
								},
								original : {
									formatted : e.display_name,
									details : e.address
								}
							}
						});
					return t
				},
				photonResponse : function (e) {
					var t = e.map(function (e) {
							return {
								lon : e.geometry.coordinates[0],
								lat : e.geometry.coordinates[1],
								address : {
									name : e.properties.name,
									postcode : e.properties.postcode,
									city : e.properties.city,
									state : e.properties.state,
									country : e.properties.country
								},
								original : {
									formatted : e.properties.name,
									details : e.properties
								}
							}
						});
					return t
				},
				peliasResponse : function (e) {
					var t = e.map(function (e) {
							return {
								lon : e.geometry.coordinates[0],
								lat : e.geometry.coordinates[1],
								address : {
									name : e.properties.name,
									house_number : e.properties.housenumber,
									postcode : e.properties.postalcode,
									road : e.properties.street,
									city : e.properties.city,
									state : e.properties.region,
									country : e.properties.country
								},
								original : {
									formatted : e.properties.label,
									details : e.properties
								}
							}
						});
					return t
				},
				googleResponse : function (e) {
					var t = ["point_of_interest", "establishment", "natural_feature", "airport"],
					s = ["street_address", "route", "sublocality_level_5", "intersection"],
					o = ["postal_code"],
					n = ["locality"],
					a = ["administrative_area_level_1"],
					i = ["country"],
					l = function (e) {
						var l = {
							name : "",
							road : "",
							postcode : "",
							city : "",
							state : "",
							country : ""
						};
						return e.forEach(function (e) {
							r.anyMatchInArray(e.types, t) ? l.name = e.long_name : r.anyMatchInArray(e.types, s) ? l.road = e.long_name : r.anyMatchInArray(e.types, o) ? l.postcode = e.long_name : r.anyMatchInArray(e.types, n) ? l.city = e.long_name : r.anyMatchInArray(e.types, a) ? l.state = e.long_name : r.anyMatchInArray(e.types, i) && (l.country = e.long_name)
						}),
						l
					},
					c = [];
					return e.forEach(function (e) {
						var t = l(e.address_components);
						r.anyItemHasValue(t) && c.push({
							lon : e.geometry.location.lng,
							lat : e.geometry.location.lat,
							address : {
								name : t.name,
								postcode : t.postcode,
								road : t.road,
								city : t.city,
								state : t.state,
								country : t.country
							},
							original : {
								formatted : e.formatted_address,
								details : e.address_components
							}
						})
					}),
					c
				},
				getSource : function () {
					return this.layer.getSource()
				},
				addLayer : function () {
					var e = this,
					t = !1,
					r = this.geocoder.getMap();
					r.getLayers().forEach(function (r) {
						r === e.layer && (t = !0)
					}),
					t || r.addLayer(this.layer)
				},
				getProvider : function (e) {
					var s,
					o = t.Nominatim.providers[e.provider],
					n = t.Nominatim.providers.names,
					a = [n.MAPQUEST, n.PELIAS, n.GOOGLE],
					i = ["de", "it", "fr", "en"];
					switch (e.provider) {
					case n.OSM:
					case n.MAPQUEST:
						s = {
							q : e.query,
							limit : e.limit,
							"accept-language" : e.lang
						},
						o.params = r.mergeOptions(o.params, s);
						break;
					case n.PHOTON:
						e.lang = e.lang.toLowerCase(),
						s = {
							q : e.query,
							limit : e.limit || o.params.limit,
							lang : i.indexOf(e.lang) > -1 ? e.lang : o.params.lang
						},
						o.params = r.mergeOptions(o.params, s);
						break;
					case n.GOOGLE:
						s = {
							address : e.query,
							language : e.lang
						},
						o.params = r.mergeOptions(o.params, s);
						break;
					case n.PELIAS:
						s = {
							text : e.query,
							size : e.limit
						},
						o.params = r.mergeOptions(o.params, s)
					}
					return a.indexOf(e.provider) > -1 && (o.params.key = e.key),
					o
				}
			},
			t.EventType = {
				ADDRESSCHOSEN : "addresschosen"
			},
			t.Nominatim.elements = {},
			t.Nominatim.providers = {
				names : {
					OSM : "osm",
					MAPQUEST : "mapquest",
					GOOGLE : "google",
					PHOTON : "photon",
					PELIAS : "pelias"
				},
				osm : {
					url : "http://nominatim.openstreetmap.org/search/",
					params : {
						format : "json",
						q : "",
						addressdetails : 1,
						limit : 10,
						"accept-language" : "en-US"
					}
				},
				mapquest : {
					url : "http://open.mapquestapi.com/nominatim/v1/search.php",
					params : {
						key : "",
						format : "json",
						q : "",
						addressdetails : 1,
						limit : 10,
						"accept-language" : "en-US"
					}
				},
				google : {
					url : "https://maps.googleapis.com/maps/api/geocode/json",
					params : {
						key : "",
						address : "",
						language : "en-US"
					}
				},
				pelias : {
					url : "https://search.mapzen.com/v1/search",
					params : {
						key : "",
						text : "",
						size : 10
					}
				},
				photon : {
					url : "https://photon.komoot.de/api/",
					params : {
						q : "",
						limit : 10,
						lang : "en"
					}
				}
			},
			t.Nominatim.featureStyle = [new ol.style.Style({
					image : new ol.style.Icon({
						scale : .7,
						anchor : [.5, 1],
						src : "//cdn.rawgit.com/jonataswalker/map-utils/master/images/marker.png"
					}),
					zIndex : 5
				}), new ol.style.Style({
					image : new ol.style.Circle({
						fill : new ol.style.Fill({
							color : [235, 235, 235, 1]
						}),
						stroke : new ol.style.Stroke({
							color : [0, 0, 0, 1]
						}),
						radius : 5
					}),
					zIndex : 4
				})],
			//t.Nominatim.html = ['<div class="ol-geocoder-search ol-control">', '<button type="button" class="ol-geocoder-btn-search"></button>', '<input type="text"', ' class="ol-geocoder-input-search"', ' placeholder="Search">', "</div>", '<ul class="ol-geocoder-result"></ul>'].join("")
			t.Nominatim.html = ['<div class="ol-geocoder-search ol-control ol-geocoder-search-expanded">', '<button type="button" class="ol-geocoder-btn-search"></button>', '<input type="text"', ' class="ol-geocoder-input-search"', ' placeholder="Search">', "</div>", '<ul class="ol-geocoder-result"></ul>'].join("")
		}
		(s),
		function (e, t) {
			var o = function () {
				var t = !1;
				if (e.XMLHttpRequest)
					t = new XMLHttpRequest;
				else if (e.ActiveXObject)
					try {
						t = new ActiveXObject("Msxml2.XMLHTTP")
					} catch (e) {
						try {
							t = new ActiveXObject("Microsoft.XMLHTTP")
						} catch (e) {
							t = !1
						}
					}
				return t
			},
			n = function (e, t) {
				if (t && "object" == typeof t) {
					var s = r.toQueryString(t);
					e += (/\?/.test(e) ? "&" : "?") + s
				}
				return e
			};
			s.Utils = {
				whiteSpaceRegex : /\s+/,
				toQueryString : function (e) {
					return Object.keys(e).reduce(function (t, s) {
						return t.push("object" == typeof e[s] ? r.toQueryString(e[s]) : encodeURIComponent(s) + "=" + encodeURIComponent(e[s])),
						t
					}, []).join("&")
				},
				json : function (e, t) {
					var r = o(),
					s = {},
					a = function () {
						200 === r.status && s.ready.call(void 0, JSON.parse(r.response))
					},
					i = function () {
						console.info("Cannot XHR " + JSON.stringify(e))
					};
					return e = n(e, t),
					r.open("GET", e, !0),
					r.setRequestHeader("Accept", "application/json"),
					r.onload = a,
					r.onerror = i,
					r.onprogress = onprogress,
					r.send(null), {
						when : function (e) {
							s.ready = e.ready
						}
					}
				},
				randomId : function (e) {
					var t = (new Date).getTime().toString(36);
					return e ? e + t : t
				},
				to3857 : function (e) {
					return ol.proj.transform([parseFloat(e[0]), parseFloat(e[1])], "EPSG:4326", "EPSG:3857")
				},
				to4326 : function (e) {
					return ol.proj.transform([parseFloat(e[0]), parseFloat(e[1])], "EPSG:3857", "EPSG:4326")
				},
				isNumeric : function (e) {
					return /^\d+$/.test(e)
				},
				classRegex : function (e) {
					return new RegExp("(^|\\s+)" + e + "(\\s+|$)")
				},
				addClass : function (e, t, s) {
					if (Array.isArray(e))
						return void e.forEach(function (e) {
							r.addClass(e, t)
						});
					for (var o = Array.isArray(t) ? t : t.split(/\s+/), n = o.length; n--; )
						r.hasClass(e, o[n]) || r._addClass(e, o[n], s)
				},
				_addClass : function (t, s, o) {
					t.classList ? t.classList.add(s) : t.className = (t.className + " " + s).trim(),
					o && r.isNumeric(o) && e.setTimeout(function () {
						r._removeClass(t, s)
					}, o)
				},
				removeClass : function (e, t, s) {
					if (Array.isArray(e))
						return void e.forEach(function (e) {
							r.removeClass(e, t, s)
						});
					for (var o = Array.isArray(t) ? t : t.split(/\s+/), n = o.length; n--; )
						r.hasClass(e, o[n]) && r._removeClass(e, o[n], s)
				},
				_removeClass : function (t, s, o) {
					t.classList ? t.classList.remove(s) : t.className = t.className.replace(r.classRegex(s), " ").trim(),
					o && r.isNumeric(o) && e.setTimeout(function () {
						r._addClass(t, s)
					}, o)
				},
				hasClass : function (e, t) {
					return e.classList ? e.classList.contains(t) : r.classRegex(t).test(e.className)
				},
				toggleClass : function (e, t) {
					return Array.isArray(e) ? void e.forEach(function (e) {
						r.toggleClass(e, t)
					}) : void(e.classList ? e.classList.toggle(t) : r.hasClass(e, t) ? r._removeClass(e, t) : r._addClass(e, t))
				},
				$ : function (e) {
					return e = "#" === e[0] ? e.substr(1, e.length) : e,
					t.getElementById(e)
				},
				isElement : function (t) {
					return "HTMLElement" in e ? !!t && t instanceof HTMLElement : !!t && "object" == typeof t && 1 === t.nodeType && !!t.nodeName
				},
				getAllChildren : function (e, t) {
					return [].slice.call(e.getElementsByTagName(t))
				},
				isEmpty : function (e) {
					return !e || 0 === e.length
				},
				emptyArray : function (e) {
					for (; e.length; )
						e.pop()
				},
				anyMatchInArray : function (e, t) {
					return e.some(function (e) {
						return t.indexOf(e) >= 0
					})
				},
				everyMatchInArray : function (e, t) {
					return t.every(function (t) {
						return e.indexOf(t) >= 0
					})
				},
				anyItemHasValue : function (e) {
					var t = !1;
					for (var s in e)
						r.isEmpty(e[s]) || (t = !0);
					return t
				},
				removeAllChildren : function (e) {
					for (; e.firstChild; )
						e.removeChild(e.firstChild)
				},
				removeAll : function (e) {
					for (var t; t = e[0]; )
						t.parentNode.removeChild(t)
				},
				getChildren : function (e, t) {
					return [].filter.call(e.childNodes, function (e) {
						return t ? 1 == e.nodeType && e.tagName.toLowerCase() == t : 1 == e.nodeType
					})
				},
				template : function (e, t) {
					var r = this;
					return e.replace(/\{ *([\w_-]+) *\}/g, function (e, s) {
						var o = void 0 === t[s] ? "" : t[s];
						return r.htmlEscape(o)
					})
				},
				htmlEscape : function (e) {
					return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
				},
				mergeOptions : function (e, t) {
					var r = {};
					for (var s in e)
						r[s] = e[s];
					for (var o in t)
						r[o] = t[o];
					return r
				},
				createElement : function (e, r) {
					var s;
					if (Array.isArray(e)) {
						if (s = t.createElement(e[0]), e[1].id && (s.id = e[1].id), e[1].classname && (s.className = e[1].classname), e[1].attr) {
							var o = e[1].attr;
							if (Array.isArray(o))
								for (var n = -1; ++n < o.length; )
									s.setAttribute(o[n].name, o[n].value);
							else
								s.setAttribute(o.name, o.value)
						}
					} else
						s = t.createElement(e);
					s.innerHTML = r;
					for (var a = t.createDocumentFragment(); s.childNodes[0]; )
						a.appendChild(s.childNodes[0]);
					return s.appendChild(a),
					s
				},
				assert : function (e, t) {
					if (!e) {
						if (t = t || "Assertion failed", "undefined" != typeof Error)
							throw new Error(t);
						throw t
					}
				},
				assertEqual : function (e, t, r) {
					if (e != t)
						throw new Error(r + " mismatch: " + e + " != " + t)
				}
			}
		}
		(e, t),
		s
	}
	();
	var r = Geocoder.Utils
}).call(this, window, document);
