async function createMap() {
    //Create map

    var map = L.map('map').setView([35, -80.95], 13);
    //Load tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 12,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    //Add markers
    var marker = L.marker([35.037262, -81.024644]).addTo(map);
    marker.bindPopup("<b>You are here</b>").openPopup()

    // add business markers
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'fsq31UuBfFYPMiXjCWFIei8CMCfw2OJHrFWNv2/anXIf1Z0='
        }
    };

    let response = await fetch('https://api.foursquare.com/v3/places/search?query=coffee&ll=35%2C-80.95&limit=5', options)
        .catch(err => console.error(err));
    data = await response.json()
    console.log(data)
    let places = getLocationsArray(data)
    console.log('places', places);
    getPlacesMarker(map, places)
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
// Create business type specific locations array
function getLocationsArray(response) {
    let locationsArray = []
    for (let i = 0; i < response.results.length; i++) {
        if (response.results[i].chains.length != 0) {
            let place = {
                name: response.results[i].chains[0].name,
                latitude: response.results[i].geocodes.main.latitude,
                longitude: response.results[i].geocodes.main.longitude
            }
            console.log('inside getloc', response.results[i].geocodes.main.latitude);
            locationsArray.push(place)
        }
    }
    return locationsArray;
}

function getPlacesMarker(map, places) {
    for (let i = 0; i < places.length; i++) {
        //add business markers
        var marker = L.marker([places[i].latitude, places[i].longitude]).addTo(map);
        marker.bindPopup(`<b>${places[i].name}</b>`)

    }
}

async function main() {
    // let coords = await getCoords();
    createMap()

    let selectBusiness = document.getElementById('business')
    selectBusiness.addEventListener('change', () => {
        console.log(selectBusiness.value);
    })
}
// fsq31UuBfFYPMiXjCWFIei8CMCfw2OJHrFWNv2/anXIf1Z0=
main()
