import React, { useState, useEffect, useRef } from "react";
import {
    GoogleMap,
    useLoadScript,
    Circle,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import axios from "./axios";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";
import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
};

const center = {
    lat: 52.4071663,
    lng: 13.019338,
};
const libraries = ["directions", "places"];
const GMAPS_INITIAL_SEARCH_RADIUS_METERS = 5000;

function Search({ panTo, getMapPoints }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: { lat: () => 43.6532, lng: () => -79.3832 },
            radius: 100 * 1000,
        },
    });

    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
            getMapPoints({ lat, lng });
        } catch (error) {
            console.log("😱 Error: ", error);
        }
    };

    return (
        <div className="search">
            <Combobox onSelect={handleSelect}>
                <ComboboxInput
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Search your location"
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" &&
                            data.map(({ id, description }) => (
                                <ComboboxOption key={id} value={description} />
                            ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
}

const fetchGoogleMaps = (startingPoint) => {
    return new Promise((resolve, reject) => {
        const NearbySearchService = new window.google.maps.places.PlacesService(
            // document.getElementsByClassName("mapContainer")[0]
            document.getElementById("foo")
        );
        const request = {
            location: new window.google.maps.LatLng(
                startingPoint.lat,
                startingPoint.lng
            ),
            radius: `${GMAPS_INITIAL_SEARCH_RADIUS_METERS}`,
        };
        const callback = (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                reject("No data successfully retrieved");
            }
        };
        NearbySearchService.nearbySearch(request, callback);
    });
};

//////////////////////////////
const Map = ({ setImages, hoveredPointId }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
        libraries,
    });
    const [selected, setSelected] = React.useState(null);
    const [allPoints, setAllPoints] = useState([]);
    const [clickedPlaceIndex, setClickedPlaceIndex] = useState(-1);
    const [startingPoint, setStartingPoint] = useState({});

    const photoPointOptions = {
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.35,
        clickable: true,
        draggable: false,
        editable: false,
        visible: true,
        zIndex: 1,
    };

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, []);

    const getMapPoints = React.useCallback(
        async ({ latLng, lat, lng }) => {
            let initialLocation;
            if (latLng) {
                initialLocation = {
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                };
            } else {
                initialLocation = {
                    lat,
                    lng,
                };
            }
            setSelected(initialLocation);
            panTo(initialLocation);

            // set marker on starting point
            setStartingPoint(initialLocation);
            // send req to flickr with lat/lng
            const {
                data: {
                    photos: { photo: photosArr },
                },
            } = await axios(
                `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=780c2a6ebd0a390c32d27af97a48da7c&content_type=1&media=photos&has_geo=1&geo_context=2&lat=${initialLocation.lat}+&lon=${initialLocation.lng}&radius=5&extras=geo%2Curl_o%2Curl_m&format=json&nojsoncallback=1`
            );

            // send req to gmaps api with lat/lng
            const points = await fetchGoogleMaps(initialLocation);
            // send both arrays to backend api POST /place
            console.log("both apis", {
                points: points,
                images: photosArr,
            });
            const { data: allPoints } = await axios.post("/api/place", {
                points: points,
                images: photosArr.slice(0, 50),
            });
            console.log("allPoints", allPoints);
            // format the points into an array of single points
            const pointsToDisplay = [];
            for (let i in allPoints) {
                pointsToDisplay.push(allPoints[i]);
            }
            console.log("pointsToDisplay", pointsToDisplay);
            setAllPoints(pointsToDisplay);
            // set images to state
            setImages(allPoints);
            setSelected(null);
        },
        [panTo, setImages]
    );
    const onMarkerClick = (ind) => {
        setClickedPlaceIndex(ind);
    };
    const renderInfoWindow = (point) => {
        let infoWindow = null;
        const divStyle = {
            background: `white`,
            border: `1px solid #ccc`,
            padding: 15,
        };
        const pointCenter = {
            lat: Number(point.lat),
            lng: Number(point.lng),
        };
        console.log(point);
        // const place = places[clickedPlaceIndex];
        // if (clickedPlaceIndex > -1) {
        infoWindow = (
            <InfoWindow
                position={pointCenter}
                // onCloseClick={() => setClickedPlaceIndex(-1)}
            >
                <div style={divStyle}>
                    <h1>{point.id}</h1>
                </div>
            </InfoWindow>
        );
        // }
        return infoWindow;
    };

    const renderAllPoints = () => {
        const bounds = new window.google.maps.LatLngBounds();
        const elements = Object.keys(allPoints).map((pointId, ind) => {
            const point = allPoints[pointId];
            const pointCenter = {
                lat: Number(point.lat),
                lng: Number(point.lng),
            };
            // What is this doing??
            // if (
            //     pointCenter.lat > 45 &&
            //     pointCenter.lat < 55 &&
            //     pointCenter.lng > 8 &&
            //     pointCenter.lng < 15
            // ) {
            //     bounds.extend(pointCenter);
            // }
            // if (ind === 0) console.log(pointCenter);
            if (point.is_natural === true) {
                return (
                    <Marker
                        key={point.id}
                        position={pointCenter}
                        onClick={() => panTo(pointCenter)}
                    />
                );
            } else {
                // console.log("### ", ind);
                const radius = point.radius * 1000 + 200;
                // const radius = 1000;
                const options = { ...photoPointOptions, radius };
                // ind === 19 &&
                //     console.log(`${ind}: ${JSON.stringify(pointCenter)}`);

                return (
                    <Circle
                        key={point.id}
                        center={pointCenter}
                        options={options}
                        onClick={() => panTo(pointCenter)}
                    />
                );
            }
        });
        mapRef.current.fitBounds(bounds);

        return elements;
    };

    if (loadError) return "Error";
    if (!isLoaded) return "Loading...";

    return (
        <GoogleMap
            className="map"
            mapContainerStyle={containerStyle}
            mapContainerClassName="mapContainer"
            center={center}
            zoom={10}
            onClick={(e) => getMapPoints(e)}
            onLoad={onMapLoad}
            options={options}
        >
            <div
                id="foo"
                style={{ width: "0px", height: "0px", display: "none" }}
            ></div>
            <Search panTo={panTo} getMapPoints={getMapPoints} />
            {selected ? (
                <InfoWindow
                    position={{ lat: selected.lat, lng: selected.lng }}
                    onCloseClick={() => {
                        setSelected(null);
                    }}
                >
                    <div>
                        <Marker
                            position={{ lat: selected.lat, lng: selected.lng }}
                            onClick={() =>
                                panTo({ lat: selected.lat, lng: selected.lng })
                            }
                            icon={{
                                url: `/map-look.png`,
                                origin: new window.google.maps.Point(0, 0),
                                anchor: new window.google.maps.Point(150, 0),
                                scaledSize: new window.google.maps.Size(
                                    300,
                                    300
                                ),
                            }}
                        />
                        <div className="loading">
                            Searching for images and places nearby
                        </div>
                    </div>
                </InfoWindow>
            ) : null}
            {hoveredPointId && renderInfoWindow(allPoints[hoveredPointId])}
            {Object.keys(allPoints).length > 0 && renderAllPoints()}
        </GoogleMap>
    );
};

export default React.memo(Map);
