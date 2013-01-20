$(function(){
	Debug.enable = true;
	if(window.location.href.indexOf("127.0.0.1") >= 0){
		Main.root = '/BeFun/';
	}
	Main.init();
})

Main = {
	root: '/',
	isLoading:false,
	panelShown:false,
	currentProjectId:null,
	init:function(){
		this.windowResize();
		$(window).resize(this.windowResize);
		this.initToolbar();
		this.initFilter();
		this.initPanel();
		this.initLightbox();
		Search.init();
		Map.init();
	},
	windowResize:function(){
		var mapHeight = $(window).height() - $('header').height();
		$('#map').height(mapHeight);
		$('#projectlist').height(mapHeight);
		var panelX = ($('#main').width() - $('#panel').width()) / 2;
		var panelY = ($('#main').height() - $('#panel').height()) / 2;
		$('#panel').css({'left': panelX, 'top': panelY});
	},
	startLoading: function(){
		//TODO show loading animation
	},
	endLoading: function(){
		//TODO hide loading animation
	},
	initToolbar: function(){
		//TODO refine the code
		$('#toggle-schools').click(function(e){
			e.preventDefault();
			if($(this).hasClass('show')){
				Debug.trace('show school');			
				Map.loadSchools();			
				$(this).removeClass().addClass('hide').text('Hide schools');
			}else if($(this).hasClass('hide')){
				Debug.trace('hide school');
				Map.cleanSchools();
			}
		});
		
		$('#toggle-shops').click(function(e){
			e.preventDefault();
			if($(this).hasClass('show')){
				Debug.trace('show shops');			
				Map.loadShops();				
				$(this).removeClass().addClass('hide').text('Hide shops');
			}else if($(this).hasClass('hide')){
				Debug.trace('hide shops');
				Map.cleanShops();
			}
		});
		
		$('#toggle-buses').click(function(e){
			e.preventDefault();
			if($(this).hasClass('show')){
				Debug.trace('show buses');
				Map.loadBusRoutes();
				$(this).removeClass().addClass('hide').text('Hide buses');
			}else if($(this).hasClass('hide')){
				Debug.trace('hide shops');
				Map.cleanBusRoutes();
			}
		});
	},
	initFilter: function(){
		$('#btn-filter').click(function(){
			$('#filter').toggle();
		});
		
		$('#filter input[name="propertytype"]').change(function(){
			if($(this).val() == 1){
				$('#apartment-filter').show();
			}else{
				$('#apartment-filter').hide();
			}
		});
	},
	initPanel: function(){
		$('#panel .close').click(function(){
			Map.center = Map.map.getCenter();
			Main.hidePanel();
		});
		
		$('#panel .tabs a').click(function(e){
			e.preventDefault();
			var target = $(this).attr('href');
			if($(target).hasClass('hidden')){
				$(target).siblings('.shown').removeClass('shown').addClass('hidden');
				$(target).removeClass('hidden').addClass('shown');
			}
		});
		
		$('#panel div.floorplan').live('click', function(){
			var id = $(this).data('id');
			Main.showLightbox();
		});
	},
	initLightbox:function(){
		$('#lightbox .close').click(function(){
			Main.hideLightbox();
		});
		$('#overlay').click(function(){
			Main.hideLightbox();
		});
		
		$('#lightbox #units a').click(function(e){
			e.preventDefault();
			var target = $(this).attr('href');
			if($(target).hasClass('hidden')){
				$(target).siblings('.shown').removeClass('shown').addClass('hidden');
				$(target).removeClass('hidden').addClass('shown');
			}
		});
	},
	showToolbar: function(){
		$('#toolbar').animate({
			top: '0'
		}, 500);
	},
	hideToolbar: function(){
		$('#toolbar').animate({
			top: '-40'
		}, 500);
	},
	showPanel:function(){
		if(!this.panelShown){
			$('#panel').show();
			Main.panelShown = true;			
		}
		Main.loadProject();
	},
	hidePanel:function(){
		if(this.panelShown){
			$('#panel').hide();		
			Main.panelShown = false;		
			this.currentProjectId = null;
		}			
	},
	hideFilter:function(){
		$('#filter').hide();
	},
	showLightbox:function(){
		var left = ($(window).width() - $('#lightbox').width()) / 2;
		var top = ($(window).height() - $('#lightbox').height()) / 2;
		$('#lightbox').css({'left': left, 'top': top}).show();
		$('#overlay').show();
	},
	hideLightbox:function(){
		$('#lightbox').hide();
		$('#overlay').hide();
	},
	loadProjectList:function(){
		$('#projectlist').empty();
		for(var i = 0; i < Search.projects.length; i++){
			var project = Search.projects[i];
			var $div = $('<div class="item" data-id="' + project.id + '" data-lat="' + project.latitude + '" data-lng="' + project.longitude + '"><img src="' + project.logo + '" alt=""/>' + project.name + '</div>');
			
			$div.click(function(){
				var lat = $(this).data('lat');
				var lng = $(this).data('lng');

				var center = new google.maps.LatLng(lat, lng);
				Map.center = center;
				Map.map.setCenter(Map.center);
				
				if(Map.map.getZoom() != 15){
					Map.map.setZoom(15);
				}
				
				Main.hidePanel();

			});
			
			$div.appendTo($('#projectlist'));
		}
	},
	loadProject:function(){
		Map.map.setCenter(Map.center);
		
		$.getJSON(Main.root + 'data/project.json', function(json){
			$('#project-name').text(json.name);
			$('#project-logo').html($('<img src="' + json.logo + '" alt="' + json.name + '">'));
			$('#project-developer').text(json.developer);
			
			$('#tab-floorplans').html();
			
			$('#subtab-description').html(json.description);
			$('#subtab-features').html(json.features);
			$('#subtab-finish').html(json.finish);
			$('#subtab-amenity').html(json.amenity);
			$('#subtab-data').html(json.data);
			$('#subtab-condition').html(json.condition);
			$('#subtab-offers').html(json.offers);
			
			var photos = json.photos;
			$('#tab-photos').empty();
			var $slider = $('<div class="sliderkit photosgallery-std">' +
								'<div class="sliderkit-nav">' +				
									'<div class="sliderkit-nav-clip">' +
										'<ul>' +
										'</ul>' +
									'</div>' +
									'<div class="sliderkit-btn sliderkit-nav-btn sliderkit-nav-prev"><a rel="nofollow" href="#" title="Previous line"><span>Previous line</span></a></div>' +
									'<div class="sliderkit-btn sliderkit-nav-btn sliderkit-nav-next"><a rel="nofollow" href="#" title="Next line"><span>Next line</span></a></div>' +
								'</div>' +
								'<div class="sliderkit-panels">' +
								'</div>' +
							'</div>');
			
			for(var i = 0; i < photos.length; i++){
				$li = $('<li><a href="#" rel="nofollow"><img src="' + photos[i] + '" width="75" height="50" alt="" /></a></li>');
				$slider.find('.sliderkit-nav-clip ul').append($li);
				
				$panel = $('<div class="sliderkit-panel"><img src="' + photos[i] + '" alt="" /></div>');
				$slider.find('.sliderkit-panels').append($panel);
			}
			
			$('#tab-photos').append($slider);
			$("#tab-photos .sliderkit").sliderkit({
				mousewheel:false,
				shownavitems:5,
				panelbtnshover:false,
				auto:false,
				circular:false,
				navscrollatend:false,
				navpanelautoswitch:false,
				debug:1
			});
			
			var floorplans = json.floorplans;
			$('#floorplan-list').empty();
			for(var i = 0; i < floorplans.length; i++){
				var div = '<div class="floorplan" data-id="{id}">{img}<div class="description">Area:{area}<br/>Level:{level}<br/>Orientation{orientation}</div></div>';
				var img = '<img src="' + floorplans[i].thumb + '" alt=""/>';
				div = div.replace("{img}", img).replace("{area}", floorplans[i].area).replace("{level}", floorplans[i].level).replace("{orientation}", floorplans[i].orientation).replace("{id}", floorplans[i].id);				
				$('#floorplan-list').append($(div));
			}
		});
	},
	updateReminder: function(){
		$('#reminder-nodes').empty();
		
		var priceText = $('#filter select[name="pricerange"] option:selected').text();
		$('#reminder-nodes').append('<span>' + priceText + '</span> | ');
		
		var typeText = $('#filter input[name="propertytype"]:checked').data('name');
		$('#reminder-nodes').append('<span>' + typeText + '</span> | ');
		
		if(Search.propertyType == 1){
			var bedroomText = "Any Beds";
			var num = '';
			$('#filter input[name="bedrooms"]:checked').each(function(){
				num = num + $(this).val() + ',';
			});
			if(num != ''){
				num = num.substr(0, num.length - 1);
				bedroomText = num + ' Beds';
			}
			$('#reminder-nodes').append('<span>' + bedroomText + '</span> |');
			
			var bathroomText = "Any Baths";
			num = '';
			$('#filter input[name="bathrooms"]:checked').each(function(){
				num = num + $(this).val() + ',';
			});
			if(num != ''){
				num = num.substr(0, num.length - 1);
				bathroomText = num + ' Baths';
			}
			$('#reminder-nodes').append('<span>' + bathroomText + '</span> |');
			
			var carspaceText = "Any Carspace";
			num = '';
			$('#filter input[name="carspace"]:checked').each(function(){
				num = num + $(this).val() + ',';
			});
			if(num != ''){
				num = num.substr(0, num.length - 1);
				carspaceText = num + ' Carspace';
			}
			$('#reminder-nodes').append('<span>' + carspaceText + '</span> |');
		}
		
		if(Search.distanceToCity != ""){
			var distanceText = $('#filter select[name="distancetocity"] option:selected').text() + " to City";
			$('#reminder-nodes').append('<span>' + distanceText + '</span> |');
		}
		
	},
	resetSchoolButton: function(){
		$('#toggle-schools').removeClass().addClass('show').text('Show schools');
	},
	resetShopButton: function(){
		$('#toggle-shops').removeClass().addClass('show').text('Show shops');
	},
	resetBusButton: function(){
		$('#toggle-buses').removeClass().addClass('show').text('Show buses');
	}
}

Map = {
	map: null,
	zoomEvent:null,
	justZoomed:null,
	currentZoom:null,
	isZoomOut:false,
	mapObjects:null,
	schoolMarkers:null,
	shopMarkers:null,
	busLayer:null,
	updateTimer:null,
	center:null,
	defaultLat:-33.828929,
	defaultLng:151.087074,
	defaultZoom:11,
	init: function(){
		this.mapObjects = new Array();
		this.schoolMarkers = new Array();
		this.shopMarkers = new Array();
		
		var mapOptions = {
    		zoom: Map.defaultZoom,
    		minZoom: 11,
    		maxZoom: 20,
    		center: new google.maps.LatLng(Map.defaultLat, Map.defaultLng),
    		mapTypeId: google.maps.MapTypeId.ROADMAP,
    		mapTypeControl: false,
    		streetViewControl: false,
    		panControl: false,
    		zoomControlOptions: {
    			position: google.maps.ControlPosition.LEFT_CENTER
    		}
  		}
  		this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  		this.bindEvents();
  		this.currentZoom = this.map.getZoom();
  		Search.execute();
	},
	bindEvents: function(){
		this.zoomEvent = google.maps.event.addListener(this.map, 'zoom_changed', function() {
			Debug.trace('zoom changed');
			Map.justZoomed = true;
			if(Map.map.getZoom() > Map.currentZoom){
				Map.isZoomOut = false;
			}else{
				Map.isZoomOut = true;
			}
			Map.currentZoom = this.getZoom();
			
			if(Map.currentZoom < 15){
				Map.cleanMap();
				Main.hidePanel();
				Main.hideToolbar();
			}else if(!Map.isZoomOut && Map.currentZoom == 15){
				Map.cleanMap();
				Main.showToolbar();
			}
		});
		
		google.maps.event.addListener(this.map, "dragstart", function () {
			
		});
		
		google.maps.event.addListener(this.map, "dragend", function () {

		});
		
		google.maps.event.addListener(this.map, 'idle', function() {
			if(Map.justZoomed){
				if(Map.updateTimer != null){
					clearTimeout(Map.updateTimer);
				}
				Map.updateTimer = setTimeout("Search.execute()", 100);
			}		
		});
	},
	unbindEvents: function(){
		google.maps.event.removeListener(this.zoomEvent);
	},
	cleanMap: function(){
		this.cleanMapObjects();
		this.cleanSchools();
		this.cleanShops();
		this.cleanBusRoutes();
	},
	cleanMapObjects: function(){
		Debug.trace('clean map: ' + this.mapObjects.length);
		
		for(var i = 0; i < this.mapObjects.length; i++){
			this.mapObjects[i].setMap(null);
		}
		this.mapObjects = new Array();
	},
	cleanSchools: function(){
		for(var i = 0; i < this.schoolMarkers.length; i++){
			this.schoolMarkers[i].setMap(null);
		}
		this.schoolMarkers = new Array();
		Main.resetSchoolButton();
	},
	cleanShops: function(){
		for(var i = 0; i < this.shopMarkers.length; i++){
			this.shopMarkers[i].setMap(null);
		}
		this.shopMarkers = new Array();
		Main.resetShopButton();
	},
	cleanBusRoutes: function(){
		if(this.busLayer != null){
			this.busLayer.setMap(null);
			this.busLayer = null;
		}
		Main.resetBusButton();
	},
	loadClusters: function(){
		Debug.trace('load clusters');
		if(Search.cache == null){
			return;
		}
		var arr = new Array();
		for(var i = 0; i < Search.clusters.length; i++){
			var cluster = new ClusterOverlay(Search.clusters[i], this.map);
			arr.push(cluster);
		}
		this.mapObjects = arr;
	},
	loadSuburbs: function(){
		Debug.trace('load suburbs');
		if(Search.cache == null){
			return;
		}
		var arr = new Array();
		for(var i = 0; i < Search.suburbs.length; i++){
			var suburb = new ClusterOverlay(Search.suburbs[i], this.map);
			arr.push(suburb);
		}
		this.mapObjects = arr;
	},
	loadProjects: function(projects){
		Debug.trace('load projects');
		var arr = new Array();
		for(var i = 0; i < Search.projects.length; i++){
			var project = new ProjectOverlay(Search.projects[i], this.map);
			arr.push(project);
		}
		this.mapObjects = arr;
	},
	loadSchools: function(schools){
		$.getJSON(Main.root + 'data/schools.json', function(json){
			var schools = json.schools;
			var arr = new Array();
			var schoolIcon = Main.root + 'img/maps/school2.png';
			for(var i = 0; i < schools.length; i++){
				var school = new google.maps.Marker({
					position: new google.maps.LatLng(schools[i].lat, schools[i].lng),
					map: Map.map,
					animation: google.maps.Animation.DROP,
					icon: schoolIcon
				});
				arr.push(school);
			}
			Map.schoolMarkers = arr;
		});	
	},
	loadShops: function(shops){
		$.getJSON(Main.root + 'data/shops.json', function(json){
			var shops = json.shops;
			var arr = new Array();
			var shopIcon = Main.root + 'img/maps/supermarket.png';
			for(var i = 0; i < shops.length; i++){
				var shop = new google.maps.Marker({
					position: new google.maps.LatLng(shops[i].lat, shops[i].lng),
					map: Map.map,
					animation: google.maps.Animation.DROP,
					icon: shopIcon
				});
				arr.push(shop);
			}
			Map.shopMarkers = arr;
		});		
	},
	loadBusRoutes: function(){
		var kmlLayerOptions = {
			preserveViewport: true
		};
		this.busLayer = new google.maps.KmlLayer('https://maps.google.com.au/maps/ms?authuser=0&vps=2&ie=UTF8&msa=0&output=kml&msid=201892530171956132134.0004d2311a34b609cf116', kmlLayerOptions);
  		this.busLayer.setMap(this.map);
	}
}

Search = {
	cache:null,
	clusters:null,
	suburbs:null,
	projects:null,
	suburbId:null,
	priceRange:null,	
	propertyType:null,
	bedrooms:null,
	bathrooms:null,
	carspace:null,
	distanceToCity:null,
	init: function(){
		$('#searchSuburb').val('');
		$('#filter select').val('');
		$('#filter input[name="propertytype"]:eq(0)').attr('checked', true);
		$('#filter input:checkbox').attr('checked', false);		
		
		$('#searchSuburb').autocomplete({
			source: function (request, response) {
				console.log(request.term);
				$.ajax({
                  url: Main.root + 'index.php/Query_Suburb/query',
                  data: {key: request.term},
                  dataType: "json",
                  type: "POST",
                  minLength: 3,
                  success: function(data){
                      response(data);
                  }
                });
		    },
		    minLength: 3,
			select: function( event, ui ) {
				Debug.trace(ui.item.id);
				Search.suburbId = ui.item.id;	
			}
		});
		
		$('#btn-search, #btn-search2').click(function(){
			Search.cache = null;
			Map.cleanMap();
			Search.execute();
		});
	},
	execute: function(){
		Debug.trace('search execute');
		Map.justZoomed = false;
		//dummy code
		if(this.cache == null){
			
			this.clusters = new Array();
			this.suburbs = new Array();
			this.projects = new Array();
			
			this.priceRange = $('#filter select[name="pricerange"]').val();
			this.propertyType = $('#filter input[name="propertytype"]:checked').val();
			
			if(this.propertyType == 1){
				var bed = '';
				$('#filter input[name="bedrooms"]:checked').each(function(){
					bed = bed + $(this).val() + ',';
				});
				if(bed.length > 0){
					bed = bed.substr(0,bed.length -1);
				}
				this.bedrooms = bed;
				
				var bath = '';
				$('#filter input[name="bathrooms"]:checked').each(function(){
					bath = bath + $(this).val() + ',';
				});
				if(bath.length > 0){
					bath = bath.substr(0, bath.length - 1);
				}
				this.bathrooms = bath;
				
				var car = '';
				$('#filter input[name="carspace"]:checked').each(function(){
					car = car + $(this).val() + ',';
				});
				if(car.length > 0){
					car = car.substr(0, car.length - 1);
				}
				this.carspace = car;
			}else{
				this.bedrooms = '';
				this.bathrooms = '';
				this.carspace = '';
			}
			
			
			this.distanceToCity = $('#filter select[name="distancetocity"]').val();
			
			Main.updateReminder();
			Main.hideFilter();
			
			$.ajax({
				type: 'POST',
				url: Main.root + "index.php/Query_Project/query",
				data: {
						suburb_id: Search.suburbId, 
						distancetocity: Search.distanceToCity,
						bedroom_count: Search.bedrooms,
						bathroom_count: Search.bathrooms,
						car_parking_count: Search.carspace,
						house_type: Search.propertyType,
						price_range: Search.priceRange
					},
				dataType: "json",
				success: function(json){
					Search.cache = json;
					for(var i = 0; i < json.length; i++){
						var cluster = json[i];
						if(cluster.count > 0){
							Search.clusters.push(cluster);
							for(var j = 0; j < cluster.suburbs.length; j++){
								var suburb = cluster.suburbs[j];
								if(suburb.count > 0){
									Search.suburbs.push(suburb);
									for(var k = 0; k < suburb.projects.length; k++){
										var project = suburb.projects[k];
										Search.projects.push(project);
									}
								}
							}
						}
					}
					var lat = Map.defaultLat;
					var lng = Map.defaultLng;
					var zoomLevel = Map.defaultZoom;
					
					if(Search.clusters.length == 1){
						if(Search.suburbs.length == 1){
							var suburb = Search.suburbs[0];
							lat = suburb.latitude;
							lng = suburb.longitude;
							zoomLevel = suburb.zoomLevel;
						}else{
							var cluster = Search.clusters[0];
							lat = cluster.latitude;
							lng = cluster.longitude;
							zoomLevel = cluster.zoomLevel;
						}
					}
					
					var center = new google.maps.LatLng(lat, lng);
					Map.center = center;
					Map.map.setCenter(Map.center);
					
					if(Map.currentZoom == zoomLevel){
						Search.loadSearchResult();
					}else{
						Map.map.setZoom(zoomLevel);
					}
					
				}
			});
		}else{
			this.loadSearchResult();
		}
		
	},
	loadSearchResult:function(){
		Main.loadProjectList();
		
		var zoom = Map.map.getZoom();
		if(zoom <= 12){
			Map.loadClusters();
		}else if(zoom <= 14){
			Map.loadSuburbs();
		}else{
			if(Map.mapObjects == null || Map.mapObjects.length == 0){
				Map.loadProjects();
			}
		}
	}
}

Debug = {
	enable:false,
	trace: function(s){
		if(this.enable){
			if ('console' in self && 'log' in console){
				console.log(s);
			}
		}
	}
}

/* ClusterOverlay Class */
function ClusterOverlay(cluster, map){
	this._count = cluster.count;
	this._map = map;
	this._div = null;
	this._markerCenter = new google.maps.LatLng(cluster.latitude, cluster.longitude);
	this._imageCenter = null;
	this._zoomLevel = cluster.zoomLevel;
	this._shape = cluster.shape;
	this._overlay = null;
	this._statusDiv = null;
	this._name = cluster.name;
	
	this.zoom = function(){		
        this._map.setCenter(this._markerCenter);
        this._map.setZoom(this._zoomLevel);
	}
	
	this.showStatus = function(){
		this._div.appendChild(this._statusDiv);
		$(this._statusDiv).css("left", $(this._div).width() + 5)
			.css("top", ($(this._div).height() - $(this._statusDiv).outerHeight()) / 2);
	}
	
	this.hideStatus = function(){
		if(this._statusDiv != null && this._statusDiv.parentNode != null){
			this._statusDiv.parentNode.removeChild(this._statusDiv);
		}
	}
	
	this.setMap(this._map);
}
ClusterOverlay.prototype = new google.maps.OverlayView();
ClusterOverlay.prototype.onAdd = function(){
	this._div = document.createElement("DIV");
	this._div.className = "cluster";
	this._div.innerHTML = this._count;
	
	this._statusDiv = document.createElement("DIV");
	this._statusDiv.className = "clusterStatus";
	this._statusDiv.innerHTML = "<span>"+ this._name +"</span>";
	
	var thisCluster = this;
	$(this._div).click(function(){
		thisCluster.zoom();
	});
	
	if(this._shape != null){
		this._overlay = new ClusterPolygon(this, this._shape, this._map);
	}else{
		$(this._div).mouseover(function(){
			thisCluster.showStatus();
		});
		
		$(this._div).mouseout(function(){
			thisCluster.hideStatus();
		});
	}
	
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._div);
}
ClusterOverlay.prototype.draw = function(){	
	var path = Main.root + "img/maps/";
	var image = null;
	var width = null;
	var height = null;
	if(this._count > 25){
		image = path + "cluster-x3.png";
		width = height = 68;
	}else if(this._count > 15){
		image = path + "cluster-x2.png";
		width = height = 56;
	}else{
		image = path + "cluster-x1.png";
		width = height = 42;
	}

	this._div.style.backgroundImage = "url('" + image + "')";
	this._div.style.width = width + "px";
	this._div.style.height = height + "px";
	this._div.style.lineHeight = height + "px";
	
	this._imageCenter = this.getProjection().fromLatLngToDivPixel(this._markerCenter);
	this._div.style.left = (this._imageCenter.x - (width / 2)) + "px";
	this._div.style.top = (this._imageCenter.y - (height / 2)) + "px";
}
ClusterOverlay.prototype.onRemove = function(){
	if(this._div.parentNode != null){
		this._div.parentNode.removeChild(this._div);
		this._div = null;
		
		if(this._overlay != null){
			this._overlay.setMap(null);
			this._overlay = null;
		}
	}
}

/* ClusterPolygon Class */
function ClusterPolygon(clusterOverlay, shape, map){
	this._clusterOverlay = clusterOverlay;
	this._map = map;
	this._options = {
		fillColor: '#666666',
		fillOpacity: 0.0,
		strokeColor: '#2789b1',
		strokeOpacity: 0.0,
		strokeWeight: 3,
		zIndex: 1
	};
	this._optionsHover = {
		strokeOpacity: 0.8,
		fillOpacity: 0.08
	}
	
	var rings = new Array();
	for(var i = 0; i < shape.length; i++){
		rings.push(new google.maps.LatLng(shape[i].latitude, shape[i].longitude));
	}
	
	this.setOptions(this._options);
	this.setPaths(rings);
	this.setMap(this._map);
	
	google.maps.event.addListener(this, 'mouseover', function(){
		this.setOptions(this._optionsHover);
		this._clusterOverlay.showStatus();
	});
	
	google.maps.event.addListener(this, 'mouseout', function(){
		this.setOptions(this._options);
		this._clusterOverlay.hideStatus();
	})
	
	google.maps.event.addListener(this, 'click', function(){
		this._clusterOverlay.zoom();
	})
}
ClusterPolygon.prototype = new google.maps.Polygon();

/* ProjectOverlay Class */
function ProjectOverlay(project, map){
	this._map = map;
	this._div = null;
	this._logo = project.logo;
	this._markerCenter = new google.maps.LatLng(project.latitude, project.longitude);
	this._imageCenter = null;
	this._projectId = project.id;
	
	this.setMap(this._map);
}
ProjectOverlay.prototype = new google.maps.OverlayView();
ProjectOverlay.prototype.onAdd = function(){
	this._div = document.createElement("DIV");
	this._div.className = "project";
	this._div.innerHTML = "<img src='" + this._logo + "'/>";
	
	var center = this._markerCenter;
	var projectId = this._projectId;
	$(this._div).click(function(){
		if(Main.currentProjectId == projectId){
			return false;
		}
		
		Main.currentProjectId = projectId;
		Map.center = center;
		Main.showPanel();
	});
	
	$(this._div).mouseover(function(){
		$(this).css('z-index', '1000');
	});
	
	$(this._div).mouseout(function(){
		$(this).css('z-index', '300');
	});
	
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._div);
}
ProjectOverlay.prototype.draw = function(){		
	this._imageCenter = this.getProjection().fromLatLngToDivPixel(this._markerCenter);
	
	var img = new Image();
	var div = this._div;
	var left = this._imageCenter.x;
	var top = this._imageCenter.y;
	
	img.onload = function() {
		div.style.left = (left - (this.width / 2) - 3) + "px";
		div.style.top = (top - (this.height / 2) - 13) + "px";
	}
	img.src = this._logo;
}
ProjectOverlay.prototype.onRemove = function(){
	if(this._div.parentNode != null){
		this._div.parentNode.removeChild(this._div);
		this._div = null;
	}
}