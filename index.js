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
     // on submit render business markers 
     document.querySelector('#submit').addEventListener('click', (e) => {
        e.preventDefault()
        console.log('btype', document.getElementById('business').value);
        getBusinessMarkers(map,document.getElementById('business').value)
    })
    // return map;
}

async function getBusinessMarkers(map, business) {
      // add business markers
      const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'API key'
        }
    };
    // Dynamically loading query params
    // console.log('business type', selectBusiness.value);
    const searchParams = new URLSearchParams({
        // query: `${selectBusiness.value}`,
        query: `${business}`,
        ll: [35.037262, -81.024644],
        limit: 5,
    }).toString();
    console.log('search query', searchParams);

    let response = await fetch(`https://api.foursquare.com/v3/places/search?${searchParams}`, options)
        .catch(err => console.error(err));
    data = await response.json()
    console.log(data)
    // console.log(data.results[0].fsqid)
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
        if (response.results[i].name) {
            // console.log('fsqid', response.results[i].name);
            let place = {
                name: response.results[i].name,
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
    let map = createMap()
    // capture select option
    let selectBusiness = document.getElementById('business')
    selectBusiness.addEventListener('change', () => {
        console.log(selectBusiness.value);
    })
   

}

main()
