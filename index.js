const myMap = {
    coordinates: [],
    map: {},
    placesLayer: {},
    businessMarkers: [],
    createMap() {
        this.map = L.map('map').setView(this.coordinates, 12);
        //Load tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 12,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        //Add geolocation marker
        var marker = L.marker(this.coordinates).addTo(this.map);
        marker.bindPopup("<b>You are here</b>").openPopup()
        this.placesLayer = L.layerGroup().addTo(this.map)
    },
}

async function getCoords() {
    //user might reject or accept or take 5min to see that i asked them to give permission
    //dont return promise resolve inline
    let pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    //make it a little less accurate so not invasive of user privacy by rounding away digits
    return [Math.floor(pos.coords.latitude), Math.floor(pos.coords.longitude)]

}

// Getting business specific markers
async function getBusinessMarkers(business, placesLayer, coords) {
    let data = await callFSQapi(business, coords)

    console.log(data)
    let places = getLocationsArray(data)
    console.log('places', places);
    // add business markers
    const placesMarker = getPlacesMarker(places, placesLayer)
    // console.log('places marker', placesMarker);

    return placesMarker;
}

// Fetching data from four square api
async function callFSQapi(business, coords) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'API-Key'
        }
    };

    // Dynamically loading query params
    console.log('business type', business);
    const searchParams = new URLSearchParams({
        query: `${business}`,
        ll: `${coords}`,
        limit: 5,
    }).toString();
    console.log('search query', searchParams);

    let response = await fetch(`https://api.foursquare.com/v3/places/search?${searchParams}`, options)
        .catch(err => console.error(err));
    data = await response.json()
    // console.log(data)
    return data
}

// Create business type specific locations array
function getLocationsArray(response) {
    let locationsArray = []
    for (let i = 0; i < response.results.length; i++) {
        if (response.results[i].name) {
            let place = {
                name: response.results[i].name,
                latitude: response.results[i].geocodes.main.latitude,
                longitude: response.results[i].geocodes.main.longitude
            }
            // console.log('inside getloc', response.results[i].geocodes.main.latitude);
            locationsArray.push(place)
        }
    }
    return locationsArray;
}
// Create markers for search result places
function getPlacesMarker(places, placesLayer) {
    let placesMarker = []
    for (let i = 0; i < places.length; i++) {
        //add business markers
        var marker = L.marker([places[i].latitude, places[i].longitude]).addTo(placesLayer)
        marker.bindPopup(`<b>${places[i].name}</b>`)
        placesMarker.push(marker)
    }
    return placesMarker;
}

async function main() {
    // Get geolocation of user
    const coords = await getCoords()

    // Create map
    myMap.coordinates = coords;
    // myMap.coordinates = [35, -80.95];
    myMap.createMap();

    // Submit event handler
    document.querySelector('#submit').addEventListener('click', (e) => {
        e.preventDefault()
        myMap.placesLayer.clearLayers()
        const business = document.getElementById('business').value;
        // console.log('btype', document.getElementById('business').value);
        getBusinessMarkers(business, myMap.placesLayer, myMap.coordinates)
    })

}

main()
