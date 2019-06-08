import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import { stores } from './geojson.js';

export class Map extends Component {
  mapBox;
  constructor (props) {
    super(props);
    this.state = {
      lng  : -77.034084,
      lat  : 38.909671,
      zoom : 14
    };
  }

  flyToStore = feature => {
    this.mapBox.flyTo({
      center : feature.geometry.coordinates,
      zoom   : 15
    });
  };

  createPopUp = feature => {
    let popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();

    let popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<React.Fragment>
          <h3>SweetGreen</h3>
          <div className="address">
            <h4>${feature.properties.address}</h4>
            <h4>${feature.properties.city} ${feature.properties.postalCode}</h4>
          </div>
        </React.Fragment>`
      )
      .addTo(this.mapBox);
    return popup;
  };

  showStore = feature => {
    this.flyToStore(feature);
    this.createPopUp(feature);

    let activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }
    document.activeElement.parentElement.classList.add('active');
  };

  buildLocationList = data => {
    const listing = data.features.map((feature, i) => (
      <div id={'listing-' + i} className='item' key={i}>
        <button className='title' dataposition={i} onClick={() => this.showStore(feature)}>
          {feature.properties.address}
        </button>
        <div className='details'>
          {feature.properties.city} &bull;{' '}
          {feature.properties.phoneFormatted ? feature.properties.phoneFormatted : 'no phone'}
        </div>
      </div>
    ));
    return listing;
  };

  buildMarkers = (feature, i) => {
    let self = this;
    let el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker(el, {
      offset: [
        0,
        -23
      ]
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(this.mapBox);
    el.addEventListener('click', function (e){
      let activeItem = document.getElementsByClassName('active');
      self.flyToStore(feature);
      self.createPopUp(feature);
      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      let listing = document.getElementById('listing-' + i);
      listing.classList.add('active');
    });
  };

  componentDidMount () {
    mapboxgl.accessToken =
      'pk.eyJ1Ijoia2VsbGV5cGVycnkiLCJhIjoiY2piNWoyM3V0MmdpZDJxbzZvOTdhODRqMCJ9.HkMTP7bfqr08XQ50UnZEaw';

    this.mapBox = new mapboxgl.Map({
      container : this.mapContainer,
      style     : 'mapbox://styles/mapbox/light-v10',
      center    : [
        this.state.lng,
        this.state.lat
      ],
      zoom      : this.state.zoom
    });

    this.mapBox.on('move', () => {
      const { lat, lng } = this.mapBox.getCenter();
      this.setState({
        lng  : lng.toFixed(4),
        lat  : lat.toFixed(4),
        zoom : this.mapBox.getZoom().toFixed(2)
      });
    });

    this.mapBox.on('load', () => {
      this.mapBox.addSource('places', { type: 'geojson', data: stores });
    });

    stores.features.map((feature, i) => this.buildMarkers(feature, i));
  }

  componentWillUnmount () {
    this.map.remove();
  }

  render () {
    const { lng, lat, zoom } = this.state;

    const style = {
      position : 'absolute',
      top      : 0,
      bottom   : 0,
      left     : 0,
      width    : '100%'
    };

    const pillStyle = {
      position     : 'absolute',
      zIndex       : 1,
      top          : '10px',
      left         : '10px',
      background   : '#bbb',
      color        : 'white',
      padding      : '8px 16px',
      borderRadius : '30px'
    };

    return (
      <div>
        <div className='sidebar'>
          <div className='heading'>
            <h1>Our locations</h1>
          </div>
          <div id='listings' className='listings'>
            {this.buildLocationList(stores)}
          </div>
        </div>
        <div id='map' className='map pad2'>
          <div style={pillStyle}>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>{' '}
          <div style={style} ref={el => (this.mapContainer = el)} />
        </div>
      </div>
    );
  }
}
