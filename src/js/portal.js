(function (win, doc) {
	'use strict';
	//var csw_url = '/geonetwork/srv/eng/csw';
	var csw_url = '/pycsw/csw.py';
	var href = [];
	var format = 'image/png';
	//var layer_group;
	//var all_layer_groups = map.getLayers();

	var map = null;
	var map_layers_control = null;
	var pagesize = 5;
	var pagesizefake = 10;
	var qpoint = [];
	var uuid;
	//var protocol;
	var csw_url1;
	var recordBBOX = [];
	var URIstatus;
	var uriSet, objUri, urlbase, recordURIprotocol;

	/**
	 * Create the map.
	 */
	var myProjectionName = "EPSG:3857";
	var projection = ol.proj.get(myProjectionName);
	

	var geolocation = new ol.Geolocation({
			projection : myProjectionName,
			tracking : true
		});

	geolocation.on('change', function (evt) {
		//console.log(geolocation.getPosition());
		map.getView().setCenter(geolocation.getPosition());
	});

	var centerPosition = geolocation.getPosition();

	//var googleLayer = new olgm.layer.Google();

	var osmLayer = new ol.layer.Tile({
			source : new ol.source.OSM(),
			visible : false
		});

	var map = new ol.Map({
			target : 'map',
			//interactions: olgm.interaction.defaults(),
			layers : [
				new ol.layer.Group({
					title : 'Base maps',
					layers : [
						new ol.layer.Tile({
							title : "OpenStreetMap",
							visible : true,
							source : new ol.source.OSM()
						})
					]
				}),
				new ol.layer.Group({
					title : 'WMS Layers',
					layers : []
				}),
				new ol.layer.Group({
					title : 'WFS Features',
					layers : []
				}),
				new ol.layer.Group({
					title : 'WCS Coverages',
					layers : []
				}),
				new ol.layer.Group({
					title : 'WMTS Layers',
					layers : []
				}),
				new ol.layer.Group({
					title : 'SOS FOIs',
					layers : []
				})

			],

			/*
			layers: [
			new ol.layer.Tile({
			title : "OpenStreetMap",
			visible: true,
			source : new ol.source.OSM()
			}),
			new olgm.layer.Google({
			mapTypeId: google.maps.MapTypeId.SATELLITE
			})
			],
			 */
			//overlays : [overlay],

			interactions : ol.interaction.defaults({
				doubleClickZoom : false
			}),
			view : new ol.View({
				//center : ol.proj.fromLonLat([0, 20]),
				center : centerPosition,
				zoom : 10
			})
		});
	//var olGM = new olgm.OLGoogleMaps({map: map});
	//olGM.activate();

	var layerSwitcher = new ol.control.LayerSwitcher({
			tipLabel : 'Layer list'
		});
	map.addControl(layerSwitcher);

	//map.getLayers().setAt(0, dguDof);


	var lonlat = null;
	var lon = null;
	var lat = null;
	var xml = null;
	map.on('dblclick', function (evt) {
		lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
		lon = lonlat[0];
		lat = lonlat[1];
		//console.log(lon);
	});

	var protocols = {
		//"undefined" : ["Unknown", "WWW"],
		"None" : ["<img src='src/img/sos.gif' width='75px'>", "SOS-DC:Source"],
		"ESRI:AIMS--http--configuration" : ["ArcIMS Map Service Configuration File (*.AXL)", "ArcIMS"],
		"ESRI:AIMS--http-get-feature" : ["ArcIMS Internet Feature Map Service", "ArcIMS"],
		"ESRI:AIMS--http-get-image" : ["ArcIMS Internet Image Map Service", "ArcIMS"],
		"GLG:KML-2.0-http-get-map" : ["Google Earth KML service (ver 2.0)", "KML"],
		"OGC:CSW" : ["OGC-CSW Catalogue Service for the Web", "CSW"],
		"OGC:KML" : ["OGC-KML Keyhole Markup Language", "KML"],
		"OGC:GML" : ["OGC-GML Geography Markup Language", "GML"],
		"OGC:ODS" : ["OGC-ODS OpenLS Directory Service", "OpenLS"],
		"OGC:OGS" : ["OGC-ODS OpenLS Gateway Service", "OpenLS"],
		"OGC:OUS" : ["OGC-ODS OpenLS Utility Service", "OpenLS"],
		"OGC:OPS" : ["OGC-ODS OpenLS Presentation Service", "OpenLS"],
		"OGC:ORS" : ["OGC-ODS OpenLS Route Service", "OpenLS"],
		"OGC:SOS" : ["<img src='src/img/sos.gif' width='75px'>", "SOS"],
		"OGC:SPS" : ["OGC-SPS Sensor Planning Service", "SPS"],
		"OGC:SAS" : ["OGC-SAS Sensor Alert Service", "SAS"],
		"OGC:WCS" : ["<img src='src/img/wcs.gif' width='75px'>", "WCS"],
		"OGC:WCS-1.1.0-http-get-capabilities" : ["<img src='src/img/wcs.gif' width='75px'>", "WCS"],
		"OGC:WCTS" : ["OGC-WCTS Web Coordinate Transformation Service", "WCTS"],
		"OGC:WFS" : ["<img src='src/img/wfs.gif' width='75px'>", "WFS"],
		"OGC:WFS-1.0.0-http-get-capabilities" : ["<img src='src/img/wfs.gif' width='75px'>", "WFS"],
		"OGC:WFS-G" : ["OGC-WFS-G Gazzetteer Service", "WFS-G"],
		"OGC:WMC-1.1.0-http-get-capabilities" : ["OGC-WMC Web Map Context (ver 1.1)", "WMC"],
		"OGC:WMS" : ["<img src='src/img/wms.gif' width='75px'>", "WMS"],
		"OGC:WMS-1.1.1-http-get-capabilities" : ["<img src='src/img/wms.gif' width='75px'>", "WMS"],
		"OGC:WMS-1.3.0-http-get-capabilities" : ["<img src='src/img/wms.gif' width='75px'>", "WMS"],
		"OGC:WMS-1.1.1-http-get-map" : ["<img src='src/img/wms.gif' width='75px'>", "WMS"],
		"OGC:WMS-1.3.0-http-get-map" : ["<img src='src/img/wms.gif' width='75px'>", "WMS"],
		"OGC:WMTS" : ["<img src='src/img/wmts.gif' width='75px'>", "WMTS"],
		"OGC:SOS-1.0.0-http-get-observation" : ["<img src='src/img/sos.gif' width='75px'>", "SOS"],
		"OGC:SOS-1.0.0-http-post-observation" : ["<img src='src/img/sos.gif' width='75px'>", "SOS"],
		"OGC:WNS" : ["OGC-WNS Web Notification Service", "WNS"],
		"OGC:WPS" : ["<img src='src/img/wps.gif' width='75px'>", "WPS"],
		"OGC:WPS-1.1.0-http-get-capabilities" : ["<img src='src/img/wps.gif' width='75px'>", "WPS"],
		"WWW:DOWNLOAD-1.0-ftp--download" : ["File for download through FTP", "FTP"],
		"WWW:DOWNLOAD-1.0-http--download" : ["<span class='glyphicon glyphicon-download-alt'></span> Download", "HTTP"],
		"FILE:GEO" : ["GIS file", "GIS"],
		"FILE:RASTER" : ["GIS RASTER file", "Raster"],
		"WWW:LINK-1.0-http--ical" : ["iCalendar (URL)", "iCal"],
		"WWW:LINK-1.0-http--link" : ["Web address (URL)", "WWW"],
		"WWW:LINK-1.0-http--partners" : ["Partner web address (URL)", "WWW"],
		"WWW:LINK-1.0-http--related" : ["Related link (URL)", "WWW"],
		"WWW:LINK-1.0-http--rss" : ["RSS News feed (URL)", "RSS"],
		"WWW:LINK-1.0-http--samples" : ["Showcase product (URL)", "WWW"],
		"DB:POSTGIS" : ["PostGIS database table", "PostGIS"],
		"DB:ORACLE" : ["ORACLE database table", "Oracle"],
		"WWW:LINK-1.0-http--opendap" : ["OPeNDAP URL", "OPeNDAP"],
		"RBNB:DATATURBINE" : ["Data Turbine", "turbine"],
		"UKST" : ["Unknown Service Type", "unknown"],
		"WWW:LINK-1.0-http--image-thumbnail" : ["WMS Thumbnail", "thumbnail"],
		"application/vnd.ogc.wms_xml" : ["<img src='src/img/wms.gif' width='75px'>", "Describe Layer"],
	};

	function BoundingBox(xml) {
		var ll = $(xml).find(escapeElementName('ows:LowerCorner')).text().split(' ');
		var ur = $(xml).find(escapeElementName('ows:UpperCorner')).text().split(' ');
		this.minx = ll[1];
		this.miny = ll[0];
		this.maxx = ur[1];
		this.maxy = ur[0];
		this.csv = [ll[0], ll[1], ur[0], ur[1]].join();
	}

	function Link(xml) {
		this.value = $(xml).text();
		this.protocol = 'None';
		// GEONETWORK
		// var protocol = $(xml).attr('protocol');
		// PYCSW

		var protocol = $(xml).attr('scheme');
		this.name = 'None';
		name = $(xml).attr('name');
		if (protocol != 'None' && protocol != "") {
			this.protocol = protocol;
			//alert ("JE PROTOKOL");
		}
		if (protocol === undefined) {
			this.protocol = 'None';
			//alert ("NIE JE PROTOKOL");
		}
		/*
		this.source = 'None';
		var source = $(xml);
		if (source){
		this.protocol = source;
		}
		 */
		if (name != 'None' && name != "") {
			this.name = name;
		}

	}

	function CswRecord(xml) {
		this.identifier = $(xml).find(escapeElementName('dc:identifier')).text();
		this.type = $(xml).find(escapeElementName('dc:type')).text();
		this.title = $(xml).find(escapeElementName('dc:title')).text();
		this.abstract = $(xml).find(escapeElementName('dct:abstract')).text();
		this.publisher = $(xml).find(escapeElementName('dc:publisher')).text();
		this.abstract2 = $(xml).find(escapeElementName('dct:abstract')).text();
		this.source = $(xml).find(escapeElementName('dc:source')).text();
		this.references = $(xml).find(escapeElementName('dct:references')).text();
		this.date = $(xml).find(escapeElementName('dc:date')).text();
		this.modified = $(xml).find(escapeElementName('dct:modified')).text();
		//this.uri = $(xml).find(escapeElementName('dc:URI')).text();
		this.URI = [];
		this.bbox = new BoundingBox($(xml).find(escapeElementName('ows:BoundingBox')));

		var self = this;

		// get all links
		// GEONETWORK CSW <dc:URI>
		// PYCSW CSW <dct:references>
		if (!this.references) {
			//alert ("DC:SOURCE");
			$(xml).find(escapeElementName('dc:source')).each(function () {
				self.URI.push(new Link($(this)));
			});
		}
		if (this.references) {
			//alert ("DCT:REFERENCES");
			$(xml).find(escapeElementName('dct:references')).each(function () {
				self.URI.push(new Link($(this)));
			});
		}

	}

	function truncate(value, length) {
		if (value.length > length) {
			return value.substring(0, length) + '...';
		}
		return value;
	}

	function escapeElementName(str) {
		return str.replace(':', '\\:').replace('.', '\\.');
	}
	function bbox2polygon(bbox) {
		if (bbox == null) {
			return new L.Polygon();
		}
		var coords = bbox.split(',');
		var p1 = new L.LatLng(coords[0], coords[1]),
		p2 = new L.LatLng(coords[2], coords[1]),
		p3 = new L.LatLng(coords[2], coords[3]),
		p4 = new L.LatLng(coords[0], coords[3]),
		polygonPoints = [p1, p2, p3, p4];
		return new L.Polygon(polygonPoints);
	}

	function style_record(rec) {
		var snippet = '<table class="table table-striped">';
		var links = "";
		uriSet = JSON.stringify(rec.URI);
					objUri = $.parseJSON(uriSet);
					urlbase = objUri[0].value;
					recordURIprotocol = urlbase.split(":")[0];
					
					//get_status_code(urlbase);

		//// get all links
		var vec;
		for (var i = 0; i < rec.URI.length; i++) {
										//&& rec.URI[i].value.lastIndexOf("http", 0) === 0
			if (rec.URI[i].value != "None" ) {
				var GetMapRequest = (rec.URI[i].value.indexOf("request=GetMap"));
				// ADDING THE SERVICE TYPE ICON WITH THE LINK TO THE ENDPOINT
				if (rec.URI[i].protocol == 'OGC:WFS' || rec.URI[i].protocol == 'OGC:WMS' || rec.URI[i].protocol == 'OGC:WCS' || rec.URI[i].protocol == 'OGC:WPS' || rec.URI[i].protocol == 'OGC:SOS' || rec.URI[i].protocol == 'OGC:WMTS' || rec.URI[i].protocol == 'None'){	
						links += '<a id="vec" title="' + rec.URI[i].name + '" href="' + rec.URI[i].value + '">' + protocols[rec.URI[i].protocol][0] + '</a>';
					}
				// ADDING THE BUTTON ADD LAYER TO MAP FOR WMS SERVICES
				if (rec.URI[i].protocol == 'OGC:WMS-1.1.1-http-get-map' || rec.URI[i].protocol == 'OGC:WMS-1.1.1-http-get-capabilities' || GetMapRequest !== -1 ) {
					//links += '<span id="' + rec.URI[i].value + '##' + rec.title + '" type="button" class="btn btn-link">Add to map</span>';
					//var uuid = rec.identifier;
					links += '<button id="btn-add2Map" type="button" class="btn btn-default" onclick="javascript:add2Map(\'' + rec.identifier + '\');"><span class="glyphicon glyphicon-log-in" href="#"  role="button"></span> Add layer to map</button>';
					//links += '<img alt="' + rec.URI[i].protocol + '" src="' + rec.URI[i].value + '" style="height:75px; float: right" />';
				}
				// ADDING THE BUTTON ADD WMTS TILE TO MAP FOR WMTS SERVICES
				if (vec == 'WMTS'){
					links += '<button id="btn-add2Map" type="button" class="btn btn-default" onclick="javascript:add2Map(\'' + rec.identifier + '\');"><span class="glyphicon glyphicon-log-in" href="#"  role="button"></span> Add tile to map</button>';
				}
				// ADDING THE BUTTON ADD FEATURE TYPE TO MAP FOR WFS SERVICES
				if (rec.URI[i].protocol == 'OGC:WFS'){
					links += '<button id="btn-add2Map" type="button" class="btn btn-default" onclick="javascript:add2Map(\'' + rec.identifier + '\');"><span class="glyphicon glyphicon-log-in" href="#"  role="button"></span> Add feature type to map</button>';
				}
				// ADDING THE BUTTON ADD FOI TO MAP FOR THE SOS SERVICES
			if (rec.URI[i].protocol == 'OGC:SOS' || rec.URI[i].protocol == 'None'){
					links += '<button id="btn-add2Map" type="button" class="btn btn-default" onclick="javascript:add2Map(\'' + rec.identifier + '\');"><span class="glyphicon glyphicon-log-in" href="#"  role="button"></span> Add FOI to map</button>';
				}
				
				// ADDING THE BUTTON ADD COVERAGE TO MAP FOR THE SOS SERVICES
				if (rec.URI[i].protocol == 'OGC:WCS'){
					links += '<button id="btn-add2Map" type="button" class="btn btn-default" onclick="javascript:add2Map(\'' + rec.identifier + '\');"><span class="glyphicon glyphicon-log-in" href="#"  role="button"></span> Add coverage to map</button>';
				}
				
				if (rec.URI[i].name == 'undefined') {
					if (rec.URI[i].protocol == 'OGC:WMTS') {
						vec = 'WMTS';
					}
					if (rec.URI[i].protocol == 'WWW:LINK-1.0-http--image-thumbnail' && vec == 'WMTS') {
						//links += '<a type="button" class="glyphicon glyphicon-download-alt" title="' + rec.URI[i].protocol + '" href="' + rec.URI[i].value + '">WMTS GetTile</a> ';
						
						links += '<a type="button" title="' + rec.URI[i].name + '" href="' + rec.URI[i].value + '" class="btn btn-default" download><span class="glyphicon glyphicon-download-alt" role="button"></span> Download Tiles</a>';
					}

					if (rec.URI[i].protocol == 'WWW:LINK-1.0-http--image-thumbnail' && vec != 'WMTS') {
						links += '<img alt="' + rec.URI[i].protocol + '" src="' + rec.URI[i].value + '" style="height:50px; float: right" />';
					}
					
					if (rec.URI[i].protocol == 'WWW:DOWNLOAD-1.0-http--download') {
						//alert(rec.URI[i].protocol);
						links += '<a type="button" title="' + rec.URI[i].name + '" href="' + rec.URI[i].value + '" class="btn btn-default" download><span id="vec" class="glyphicon glyphicon-download-alt" role="button"></span> Download features</a>';
						//links += '<a id="vec" title="' + rec.URI[i].name + '" href="' + rec.URI[i].value + '">' + protocols[rec.URI[i].protocol][0] + '</a>';
					}
					
					// WxS TYPE ICON SERVICE ENDPOINT LINK
					
				} else {
					links += '<a type="button" class="btn btn-link" title="' + rec.URI[i].name + '" href="' + rec.URI[i].value + '">' + rec.URI[i].name + '</a> ';
				}
			}
			if (rec.URI[i].protocol == 'OGC:WMS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_wms'
			}
			if (rec.URI[i].protocol == 'OGC:WMTS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_wmts'
			}
			if (rec.URI[i].protocol == 'OGC:WCS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_wcs'
			}
			if (rec.URI[i].protocol == 'OGC:WFS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_wfs'
			}
			if (rec.URI[i].protocol == 'OGC:WPS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_wps'
			}
			if (rec.URI[i].protocol == 'OGC:SOS') {
				csw_url1 = 'https://bolegweb.geof.unizg.hr/pycsw_sos'
			}
		}
		//recordBBOX = rec.bbox.csv;
		var uuid = rec.identifier;
		
		console.log("############################ UUID:" + uuid);
		var url = csw_url1 + "?service=CSW&version=2.0.2&request=GetRecordById&elementsetname=full&outputSchema=http://www.isotc211.org/2005/gmd&id=" + rec.identifier;
		var title2 = '<a id="' + rec.bbox.csv + '" class="a-record" target="_blank" title="' + rec.title + '" href="' + url + '">' + rec.title + '</a>';
		snippet += '<thead><tr><td bgcolor="#00ffc3"><h4>'+ title2 +'</h4></td></tr></thead>';
		snippet += '<tfoot><tr><td>'+ rec.identifier +'</td></tr></tfoot>';
		snippet += '<tbody><tr><td><div>';
		snippet += '<h5>' + truncate(rec.abstract, 255) + '</h5>';
		snippet += '<em>' + rec.publisher + '</em><br/>';
		snippet += '<small><strong>Resource Type: </strong>' + rec.type + '</small><br/>';
		snippet += '<small><strong>Bounding box: </strong>' + rec.bbox.csv + '</small><br/>';
		snippet += '<small><strong>Protocol: </strong>: ' + recordURIprotocol + '</small><br/>';
		snippet += '<small><strong>URL: </strong>' + urlbase + '</small><br/>';
		snippet += links + '<br>';
		//snippet += '<small>' + uuid + '</small><br/>';
		snippet += '</td></tr></tbody>';
		snippet += '</table>';
		return snippet;		
	}
	
	
	
	
	
	function search(startposition) {
		//$('#div-csw-results-glass').toggle();

		if (!startposition) {
			startposition = 1;
		}
		var freetext = $('#srch-term').val().trim();
		var bbox_enabled = $('#input-bbox').parent().hasClass('toggle btn btn-primary');
		var poi_enabled = $('#input-poi').parent().hasClass('toggle btn btn-primary');
		var sortby = $('#select-sortby option:selected').val();
		var searchConcept = $("#search_concept").text();
		if (searchConcept == 'Sensor Observation Services') {
			csw_url = '/pycsw_sos';
		}
		if (searchConcept == 'Web Map Services') {
			csw_url = '/pycsw_wms';
		}
		if (searchConcept == 'Web Feature Services') {
			csw_url = '/pycsw_wfs';
		}
		if (searchConcept == 'Web Coverage Services') {
			csw_url = '/pycsw_wcs';
		}
		if (searchConcept == 'Web Processing Services') {
			csw_url = '/pycsw_wps';
		}
		if (searchConcept == 'Web Map Tile Services') {
			csw_url = '/pycsw_wmts';
		}
		if (searchConcept == 'Anything') {
			csw_url = '/pycsw/csw.py';
		}

		//console.log (mapClicked]);

		if (bbox_enabled && map != null) {
			var bounds = ol.proj.transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');

			//console.log(pointCoord);
			var qbbox = '<ogc:BBOX><ogc:PropertyName>ows:BoundingBox</ogc:PropertyName><gml:Envelope xmlns:gml="http://www.opengis.net/gml"><gml:lowerCorner>' + bounds[1] + ' ' + bounds[0] + '</gml:lowerCorner><gml:upperCorner>' + bounds[3] + ' ' + bounds[2] + '</gml:upperCorner></gml:Envelope></ogc:BBOX>';
			$('#queryInfo').html('<p>Spatial search: ' + bounds + ' </p>');
		}

		var data = '<csw:GetRecords maxRecords="' + pagesize + '" startPosition="' + startposition + '"  outputSchema="http://www.opengis.net/cat/csw/2.0.2" resultType="results" service="CSW" version="2.0.2" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd"  xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc"><csw:DistributedSearch/><csw:Query typeNames="csw:Record"><csw:ElementSetName>full</csw:ElementSetName>';
		if (freetext != '') {
			if (bbox_enabled && map != null) {
				data += '<csw:Constraint version="1.1.0"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:And><ogc:PropertyIsLike escapeChar="\\" singleChar="_" wildCard="%"><ogc:PropertyName>csw:AnyText</ogc:PropertyName><ogc:Literal>%' + $("#srch-term").val().trim() + '%</ogc:Literal></ogc:PropertyIsLike>' + qbbox + '</ogc:And></ogc:Filter></csw:Constraint>';
				$('#queryInfo').html('<p>Spatial search: ' + bounds + ' </p><p>Any text search: ' + freetext + ' </p>');
			} else {
				data += '<csw:Constraint version="1.1.0"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:PropertyIsLike escapeChar="\\" singleChar="_" wildCard="%"><ogc:PropertyName>csw:AnyText</ogc:PropertyName><ogc:Literal>%' + $("#srch-term").val().trim() + '%</ogc:Literal></ogc:PropertyIsLike></ogc:Filter></csw:Constraint>';
				$('#queryInfo').html('<p>Any text search : ' + freetext + ' </p>');
			}
		} else if (bbox_enabled && map != null) {
			data += '<csw:Constraint version="1.1.0"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' + qbbox + '</ogc:Filter></csw:Constraint>';
			$('#queryInfo').html('<p>Spatial search: ' + bounds + ' </p>');
		} else if (map != null && poi_enabled) {
			data += '<csw:Constraint version="1.1.0"><ogc:Filter><ogc:Contains><ogc:PropertyName>ows:BoundingBox</ogc:PropertyName><gml:Point><gml:pos>' + lat + ' ' + lon + '</gml:pos></gml:Point></ogc:Contains></ogc:Filter></csw:Constraint>';
		}
		data += '</csw:Query></csw:GetRecords>';

		$.ajax({
			type : "post",
			url : csw_url,
			contentType : "text/xml",
			data : data,
			dataType : "text",
			success : function (xml) {
				$('#table-csw-results').empty();
				//$('#div-csw-results-glass').toggle();
				//alert(xml);
				// derive results for paging
				var matched = parseInt($(xml).find(escapeElementName('csw:SearchResults')).attr('numberOfRecordsMatched'));
				var returned = parseInt($(xml).find(escapeElementName('csw:SearchResults')).attr('numberOfRecordsReturned'));
				var nextrecord = parseInt($(xml).find(escapeElementName('csw:SearchResults')).attr('nextRecord'));
				//var nextrecord = nextrec*5;

				$('#input-startposition').val(startposition);
				$('#input-nextrecord').val(nextrecord);
				$('#input-matched').val(matched);

				if (matched == 0) {
					//$('#div-results').html('');
					$('#div-results').empty();
					$('#pager').empty();
					$('#md-info').modal('show');
					$('#table-csw-results').html('<tr><td><p>No results matching your query</p></tr></td>');
					return;
				}
				if (nextrecord == 0 || nextrecord >= matched) { // at the end
					$('#li-next').attr('class', 'disabled');
					nextrecord = matched;
				} else {
					$('#li-next').attr('class', 'active');
				}
				if (startposition == 1) {
					$('#li-previous').attr('class', 'disabled');
				} else {
					$('#li-previous').attr('class', 'active');
				}

				var results = '<strong>Results ' + (startposition) + '-' + (nextrecord - 1) + ' of ' + matched + ' record(s)</strong>';

				$('#div-results').html(results);
				

				$(escapeElementName('csw:Record'), xml).each(function (record) {
					var rec = new CswRecord($(this));
					$("#table-csw-results").append(style_record(rec));
					get_status_code(urlbase);
					
					
				});
				$('#md-info').modal('show');
				$('#md-info').on('shown.bs.modal', function() {
					//$("#txtname").focus();
					//alert (urlbase);
					//get_status_code(urlbase);
				});
				
				
				
			}
		});
		
		
	}

	
	function get_status_code(urlbase)
	{
		$.ajax({url: urlbase,
            dataType: "jsonp",
            type: "HEAD",
			//timeout:1000,
			/*
			success:function(data, status, jqXHR) {
					  //alert(urlbase + "SUCCESS"); 
					},
			error: function(jqXHR, status, err)
			{
				//alert(err + "ERROR"); 
			},
			complete: function(jqXHR, status)
			{
				//alert(status + "COMPLETE"); 
			},
			*/
			statusCode: {
				200: function (response) {
					alert('200 Working!');
				},
				400: function (response) {
					alert('400 Not working!');
				},
				0: function (response) {
					alert('0 Not working!');
				}
			}			
     });
	}

	$("#srch-form").keypress(function (e) {
		//e.preventDefault();
		if (e.keyCode == 13) { // Enter key pressed, but not submitting the form to a page refresh
			search();
			return false;
		}
	});

	$('#btn-search').click(function (e) {
		e.preventDefault();
		search();
		return false;
	});

	$('#map').dblclick(function (e) {
		e.preventDefault();
		var poi_enabled = $('#input-poi').parent().hasClass('toggle btn btn-primary');
		if (poi_enabled) {
			search();
			return false;
		} else {
			$('#click-info').modal('show');
			$('#click-info-results').html('<p>You clicked here: ' + lat + ',' + lon + '</p><p>If you wanna use this location as query select OVERLAP POI option</p>');
		}

	});
	$('#a-previous').click(function (event) {
		event.preventDefault();
		var startposition2 = $('#input-startposition').val() - (pagesize);
		if (startposition2 < 1) {
			return;
		}
		search(startposition2);
	});
	$('#a-next').click(function (event) {
		event.preventDefault();
		var nextrecord2 = parseInt($('#input-nextrecord').val());
		var matched2 = parseInt($('#input-matched').val());
		if (nextrecord2 == 0 || nextrecord2 >= matched2) {
			return;
		}
		search(nextrecord2);
	});
	/*
	$("table").on("click", "span", function (event) {
	var tokens = $(this).attr('id').split('##');
	console.log (tokens);
	var getmap = tokens[0].split('?');
	console.log (getmap);
	var url = getmap[0];
	console.log (url);
	console.log (getmap[1]);
	var getmap_kvp = getmap[1].split('&');
	console.log (getmap_kvp);
	for (var i = 0; i < getmap_kvp.length; i++) {
	var temp = getmap_kvp[i].toLowerCase();
	if (temp.search('layers') != -1) {
	var kvp = getmap_kvp[i].split('=');
	var layer_name = kvp[1];
	}
	}

	for (var prop in map_layers_control._layers) {
	if (url == map_layers_control._layers[prop].layer._url && tokens[1] == map_layers_control._layers[prop].name) {
	return;
	}
	}

	var layer = L.tileLayer.wms(url, {
	layers : layer_name,
	format : 'image/png',
	transparent : true,
	});
	map_layers_control.addOverlay(layer, tokens[1]);
	map.addLayer(layer);
	});
	 */
	$("table").on("mouseenter", "td", function (event) {
		var polygon_layer = null;
		var bbox = $(this).find('[id]').attr('id');
		if (polygon_layer != null && map.hasLayer(polygon_layer)) {
			map.removeLayer(polygon_layer);
		}
		if ($('#input-footprints').is(':checked')) {
			if (bbox != undefined) {
				polygon_layer = bbox2polygon(bbox);
				map.addLayer(polygon_layer);
			}
		}
	});

	//Instantiate with some options and add the Control
	var geocoder = new Geocoder('nominatim', {
			provider : 'photon',
			lang : 'en',
			placeholder : 'Search for place ...',
			limit : 10,
			keepOpen : true
		});
	map.addControl(geocoder);

	//Listen when an address is chosen
	geocoder.on('addresschosen', function (evt) {
		var feature = evt.feature,
		coord = evt.coordinate,
		address_html = feature.get('address_html');
		content.innerHTML = '<p>' + address_html + '</p>';
		overlay.setPosition(coord);
	});

	/**
	 * Popup
	 **/
	var
	container = doc.getElementById('popup'),
	content = doc.getElementById('popup-content'),
	closer = doc.getElementById('popup-closer'),
	overlay = new ol.Overlay({
			element : container,
			offset : [0, -40]
		});
	closer.onclick = function () {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	};
	map.addOverlay(overlay);

	/*
	AUTOCOMPLETE QUERY TO SQLLITE PHP API
	 */
	$(document).ready(function () {

		$('#srch-term').click(function () {
			//alert ("CLICKED");
			var service;
			if ($('#search_concept').text() == "Web Processing Services") {
				service = "/ogcwxs/rest/search_wps.php";
			}
			if ($('#search_concept').text() == "Web Map Services") {
				service = "/ogcwxs/rest/search_wms.php";
			}
			if ($('#search_concept').text() == "Web Feature Services") {
				service = "/ogcwxs/rest/search_wfs.php";
			}
			if ($('#search_concept').text() == "Web Coverage Services") {
				service = "/ogcwxs/rest/search_wcs.php";
			}
			if ($('#search_concept').text() == "Sensor Observation Services") {
				service = "/ogcwxs/rest/search_sos.php";
			}

			if ($('#search_concept').text() == "Web Map Tile Services") {
				service = "/ogcwxs/rest/search_wmts.php";
			}
			if ($('#search_concept').text() == "Anything") {
				service = "/ogcwxs/rest/search_all.php";
			}
			//console.log(service);
			$('#srch-term').autocomplete({
				source : service,

				minLength : 3
			});
		});
	});

	/*
	SOMETHING
	 */
	$(document).ready(function (e) {
		$('.search-panel .dropdown-menu').find('a').click(function (e) {
			e.preventDefault();
			var param = $(this).attr("href").replace("#", "");
			var concept = $(this).text();
			$('.search-panel span#search_concept').text(concept);
			$('.input-group #search_param').val(param);
		});
	});

	/*
	SOME OTHER THING
	 */

	$(function () {
		$('.button-checkbox').each(function () {

			// Settings
			var $widget = $(this),
			$button = $widget.find('button'),
			$checkbox = $widget.find('input:checkbox'),
			color = $button.data('color'),
			settings = {
				on : {
					icon : 'glyphicon glyphicon-check'
				},
				off : {
					icon : 'glyphicon glyphicon-unchecked'
				}
			};

			// Event Handlers
			$button.on('click', function () {
				$checkbox.prop('checked', !$checkbox.is(':checked'));
				$checkbox.triggerHandler('change');
				updateDisplay();
			});
			$checkbox.on('change', function () {
				updateDisplay();
			});

			// Actions
			function updateDisplay() {
				var isChecked = $checkbox.is(':checked');

				// Set the button's state
				$button.data('state', (isChecked) ? "on" : "off");

				// Set the button's icon
				$button.find('.state-icon')
				.removeClass()
				.addClass('state-icon ' + settings[$button.data('state')].icon);

				// Update the button's color
				if (isChecked) {
					$button
					.removeClass('btn-default')
					.addClass('btn-' + color + ' active');
				} else {
					$button
					.removeClass('btn-' + color + ' active')
					.addClass('btn-default');
				}
			}

			// Initialization
			function init() {

				updateDisplay();

				// Inject the icon if applicable
				if ($button.find('.state-icon').length === 0) {
					$button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
				}
			}
			init();
		});
		var new_checkbox_button = function (name, id) {
			return "<li><span class='button-checkbox'><button type='button' class='btn btn-sm btn-primary active' data-color='primary'><i class='state-icon glyphicon glyphicon-check'></i>&nbsp;" + name + "</button><input type='checkbox' class='hidden' checked=''></span></li>";
		};

		$("#add").click(function () {
			$("#selected_targets").append(new_checkbox_button("lallalala", "1111"));
		});
	})

	// jQuery ajaxComplete() Method
	$(document).ready(function () {
		$(document).ajaxStart(function () {
			$("#wait").css("display", "block");
		});
		$(document).ajaxComplete(function () {
			$("#wait").css("display", "none");
		});
	});

	// FUNCTION TO ADD WMS LAYER TO THE Map
	window.add2Map = function (uuidVal) {
		//alert("FUNGUJEM!@");
		var getRecordByIdTemplate = '<?xml version="1.0" encoding="UTF-8"?>' +
			'<GetRecordById service="CSW" version="2.0.2" outputFormat="application/xml" outputSchema="http://www.isotc211.org/2005/gmd" xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd">' +
			'   <Id>#uuid#</Id>' +
			'   <ElementSetName>full</ElementSetName>' +
			'</GetRecordById>';
		console.log(uuidVal);
		var serviceType,
		serviceURL,
		layerSource,
		layerNS,
		layerTitle,
		layerName,
		layerInstance,
		westBound,
		eastBound,
		southBound,
		northBound,
		xMinYMin,
		xMaxYMax,
		extentCoordinates = [],
		boundingExtent;
		// Only WMS service supported for now
		$.ajax({
			type : "post",
			url : csw_url,
			data : getRecordByIdTemplate.replace('#uuid#', uuidVal),
			crossDomain : true,
			dataType : "xml",
			success : function (xml) {
				serviceType = $(xml).find("gmd\\:onLine, onLine").first().find("gmd\\:protocol, protocol").find("gco\\:CharacterString, CharacterString").text();
				serviceURL = $(xml).find("gmd\\:onLine, onLine").first().find("gmd\\:URL, URL").first().text();
				layerName = $(xml).find("gmd\\:onLine, onLine").first().find("gmd\\:name, name").find("gco\\:CharacterString, CharacterString").text();
				layerTitle = $(xml).find("gmd\\:title, title").first().find("gco\\:CharacterString, CharacterString").text();
				westBound = $(xml).find("gmd\\:geographicElement, geographicElement").first().find("gmd\\:westBoundLongitude, westBoundLongitude").find("gco\\:Decimal, Decimal").text();
				eastBound = $(xml).find("gmd\\:geographicElement, geographicElement").first().find("gmd\\:eastBoundLongitude, eastBoundLongitude").find("gco\\:Decimal, Decimal").text();
				southBound = $(xml).find("gmd\\:geographicElement, geographicElement").first().find("gmd\\:southBoundLatitude, southBoundLatitude").find("gco\\:Decimal, Decimal").text();
				northBound = $(xml).find("gmd\\:geographicElement, geographicElement").first().find("gmd\\:northBoundLatitude, northBoundLatitude").find("gco\\:Decimal, Decimal").text();
				//xMinYMin = ol.proj.fromLonLat([westBound, southBound]);
				//console.log (xMinYMin);
				xMaxYMax = ol.proj.fromLonLat([eastBound, northBound]);
				//console.log (xMaxYMax);
				extentCoordinates = [xMinYMin, xMaxYMax];
				//console.log (extentCoordinates);
				
				// WMS DATA
				if (serviceType == 'OGC:WMS') {
					layerSource = new ol.source.TileWMS({
							url : serviceURL,
							params : {
								'FORMAT' : format,
								'VERSION' : '1.1.1',
								tiled : true,
								LAYERS : layerName,
							}
						});

						//46.3,9.51,49.13,17.29
						
						
					var layerInstance = new ol.layer.Tile({
							title : layerTitle,
							visible : true,
							source : layerSource
						});
					//map.getView().fit(calculateExtent(map.getSize()));
					//alert(extentCoordinates);
					var WMSLayerGroup = getWMSGroup();
					WMSLayerGroup.push(layerInstance);
					
				}

				// WMTS DATA
				if (serviceType == 'OGC:WMTS') {
					var projectionExtent = projection.getExtent();
					var matrixSet = 'EPSG:900913';
					var size = ol.extent.getWidth(projectionExtent) / 256;
					var resolutions = new Array(25);
					var matrixIds = new Array(25);
					for (var z = 0; z < 25; ++z) {
						resolutions[z] = size / Math.pow(2, z);
						matrixIds[z] = matrixSet + ":" + z;
					}
					layerSource = new ol.source.WMTS({
							url : serviceURL,
							layer : layerName,
							matrixSet : matrixSet,
							format : format,
							projection : projection,
							tileGrid : new ol.tilegrid.WMTS({
								origin : ol.extent.getTopLeft(projectionExtent),
								resolutions : resolutions,
								matrixIds : matrixIds
							}),
							//style : 'default',
							wrapX : true
						});
					var layerInstance = new ol.layer.Tile({
							title : layerTitle,
							opacity : 0.7,
							source : layerSource
						});
					//var lt = 'WMTS Layers';
					var WMTSLayerGroup = getWMTSGroup();
					WMTSLayerGroup.push(layerInstance);
					map.getView().fit(extentCoordinates,map.getSize());

				}
				
				if (serviceType == 'OGC:WCS') {
					swal("Not Implemented yet");
				}
				
				if (serviceType == 'OGC:SOS' || !serviceType) {
					swal("Not Implemented yet");
				}
				
				// WFS DATA
				if (serviceType == 'OGC:WFS') {
					//var bounds = map.getView().calculateExtent(map.getSize());
					var bounds = ol.proj.transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');
					var feature = layerName;
					
					var layerInstance = new ol.layer.Vector({
						title: layerTitle,
						
						source: new ol.source.Vector({
								
								//projection: 'EPSG:3857',
								
								/*
								url: function(extent) {
								  return serviceURL + '?' +
									'service=WFS&'+
									'version=1.1.0&'+
									'request=GetFeature&'+
									'typename='+ feature + '&' +
									'outputFormat=application/json&' +
									'crsname=EPSG:4326&' +
									'bbox=' + bounds.join(',');
								},
								*/
								loader: function(extent, resolution, projection) {
											var bounds = ol.proj.transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');
											var url = serviceURL + '?' +
											'service=WFS&'+
											'version=1.1.0&'+
											'request=GetFeature&'+
											'typename='+ feature + '&' +
											'outputFormat=application/json&' +
											'crsname=EPSG:4326&' +
											'bbox=' + bounds.join(',');
											var urlProt = serviceURL.split(':');
											urlProt = urlProt[0];
											console.log (urlProt);
											if (urlProt == 'http')
											{
											 console.log("INSECURE HTTP");
											}
											else {
											$.ajax({url: url, type : "GET", dataType: 'jsonp'}).then(function(response) {
												var format = new ol.format.GeoJSON();
												var res = $.parseJSON(response);
												console.log(res);
												layerInstance.getSource().addFeatures(format.readFeatures(res,{
												   dataProjection : 'EPSG:4326',
												   featureProjection : 'EPSG:3857'
												}));
												
												
											/*
											var features = format.readFeatures(response,
												{featureProjection: 'EPSG:3857'});
											vectorSource.addFeatures(features);
											*/
												});
										}
									},
								strategy: ol.loadingstrategy.bbox,
								style: new ol.style.Style({
									  stroke: new ol.style.Stroke({
										color: 'rgba(0, 0, 255, 1.0)',
										width: 2
									  })
									})
							  })
					  
					  });
					/*
					var layerInstance = new ol.layer.Vector({
						title: layerTitle,
						source: vectorSource,
						style: new ol.style.Style({
						  stroke: new ol.style.Stroke({
							color: 'rgba(0, 0, 255, 1.0)',
							width: 2
						  })
						})
					  });
					  */
					  
					  
					  
					  /*
					  var vectorSource = new ol.source.Vector({
										format: new ol.format.WFS(),

										loader: function(bounds,resolution,projection) {
											var bounds = ol.proj.transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');
												var url = serviceURL +
												'?service=WFS&request=GetFeature&typename='+ feature + '&srsname=EPSG:4326&' +
												'version=1.1.0&' + bounds.join(',');

												$.ajax({ url: url }).done(function(resp) {
														fWFS = new ol.format.WFS(),
														vectorSource.addFeatures(fWFS.readFeatures(resp));
												 });
										},
										strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
												maxZoom: 19})),
								});

								var vectorStyle = new ol.style.Style({
										image: new ol.style.Circle({
											radius: 6,
											fill: new ol.style.Fill({
												color: 'rgba(255,255,255,0.2)',
											}),
											stroke: new ol.style.Stroke({
												color: 'rgba(0,0,255,0.6)',
												width: 2,
											})
										})
								});

								var layerInstance = new ol.layer.Vector ({
										source: vectorSource,
											style: vectorStyle,
								});
								layerInstance.getSource().addFeatures
								*/
					  
					  
					//var lt = 'WMTS Layers';
					var WFSLayerGroup = getWFSGroup();
					WFSLayerGroup.push(layerInstance);
					var extent = layerInstance.getSource().getExtent();
					//map.getView().fit(extent,map.getSize());

				}
				

				layerNS = $(this).find("gmd\\:URL, URL").text();
				layerName = $(this).find("gmd\\:URL, URL").text();
			}
		});
	}

	function getWMSGroup() {
		var layers = map.getLayers();
		var length = layers.getLength(),
		l;
		for (var i = 0; i < length; i++) {
			l = layers.item(i);
			var lt = l.get('title');
			// check for layers within groups
			if (lt === 'WMS Layers') { // Title of Group
				if (l.getLayers) {
					var innerLayers = l.getLayers().getArray();
					return innerLayers;
				}
			}
		}
	}
	
	function getWMTSGroup(){
		var layers = map.getLayers();
		var length = layers.getLength(),
		l;
		for (var i = 0; i < length; i++) {
			l = layers.item(i);
			var lt = l.get('title');
			// check for layers within groups
			if (lt === 'WMTS Layers') { // Title of Group
				if (l.getLayers) {
					var innerLayers = l.getLayers().getArray();
					return innerLayers;
				}
			}
		}
	}
	
	function getWFSGroup(){
		var layers = map.getLayers();
		var length = layers.getLength(),
		l;
		for (var i = 0; i < length; i++) {
			l = layers.item(i);
			var lt = l.get('title');
			// check for layers within groups
			if (lt === 'WFS Features') { // Title of Group
				if (l.getLayers) {
					var innerLayers = l.getLayers().getArray();
					return innerLayers;
				}
			}
		}
	}
swal({
  title: "Welcome to the Bolegweb OGC resources geoportal!",
  text: "The portal is under the development. You might find some features not working yet ..",
  imageUrl: "/ogcwxs/portal/src/img/logo_125x125.png"
});
})(window, document);
