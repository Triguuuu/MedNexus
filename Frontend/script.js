//  MAP 
const map = L.map('map').setView([25.4358,81.8463],13)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

let routingControl = null
let hospitalMarkers = []

// USER LOCATION 
navigator.geolocation.getCurrentPosition(
(position) => {

    const userLat = position.coords.latitude
    const userLng = position.coords.longitude

    window.userLat = userLat
    window.userLng = userLng

    L.marker([userLat, userLng])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup()

    map.setView([userLat, userLng], 14)

    loadHospitals(userLat, userLng)

},
() => alert("Location not allowed!")
)


// LOAD HOSPITALS 
function loadHospitals(userLat, userLng){

fetch("http://127.0.0.1:3000/hospitals")
.then(res => res.json())
.then(hospitals => {

    if(!hospitals || hospitals.length === 0){
        alert("⚠ No hospitals in DB")
        return
    }

    // clear old markers
    hospitalMarkers.forEach(m => map.removeLayer(m))
    hospitalMarkers = []

    const featureSection = document.querySelector(".features")
    featureSection.innerHTML = ""

    let nearest = null
    let bestScore = -Infinity

    // find best
    hospitals.forEach(h => {
        const distance = getDistance(userLat,userLng,h.lat,h.lng)
        const score = h.beds - distance

        if(score > bestScore){
            bestScore = score
            nearest = h
        }
    })

    // add markers
    hospitals.forEach(h => {

        const distance = getDistance(userLat,userLng,h.lat,h.lng)
        const isBest = nearest && h.name === nearest.name

        const marker = L.marker([h.lat, h.lng])
        .addTo(map)
        .bindPopup(`
            <b>${h.name}</b><br>
            Beds: ${h.beds}<br>
            Distance: ${distance.toFixed(2)} km
            ${isBest ? "<br>⭐ BEST" : ""}
        `)

        hospitalMarkers.push(marker)

        // cards
        featureSection.innerHTML += `
        <div class="card" style="${isBest ? 'border:2px solid green;' : ''}">
            <h3>${h.name} ${isBest ? '⭐' : ''}</h3>
            <p>🛏 Beds: ${h.beds}</p>
            <p>📏 Distance: ${distance.toFixed(2)} km</p>
        </div>
        `
    })

    // route
    if(nearest){
        showRoute(userLat,userLng,nearest.lat,nearest.lng)
    }

})
.catch(err=>{
    console.log(err)
    alert("Hospital load failed")
})

}


//  ROUTE 
function showRoute(userLat,userLng,hLat,hLng){

    if(routingControl){
        map.removeControl(routingControl)
    }

    routingControl = L.Routing.control({
        waypoints:[
            L.latLng(userLat,userLng),
            L.latLng(hLat,hLng)
        ],
        createMarker:()=>null,
        routeWhileDragging:false,
        addWaypoints:false
    }).addTo(map)

    routingControl.on('routesfound', function(e){

        const route = e.routes[0]

        const distance = (route.summary.totalDistance/1000).toFixed(2)
        const time = (route.summary.totalTime/60).toFixed(1)

        document.getElementById("result").innerHTML = `
        🏁 Route Ready<br>
        📏 ${distance} km<br>
        ⏱ ${time} min
        `
    })
}


// DISTANCE 
function getDistance(lat1, lon1, lat2, lon2){
const R = 6371
const dLat = (lat2-lat1) * Math.PI/180
const dLon = (lon2-lon1) * Math.PI/180

const a =
Math.sin(dLat/2)**2 +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2)**2

const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
return R*c
}


// EMERGENCY 
function sendEmergency(){

    if(!window.userLat){
        alert("Location not ready")
        return
    }

    document.getElementById("result").innerHTML = "⏳ Sending..."

    fetch("http://127.0.0.1:3000/emergency",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            lat:window.userLat,
            lng:window.userLng
        })
    })
    .then(res=>res.json())
    .then(data=>{

        if(!data.hospital){
            throw new Error("no hospital")
        }

        document.getElementById("result").innerHTML = `
        🏥 ${data.hospital.name}<br>
        📏 ${data.hospital.distance.toFixed(2)} km
        `
    })
    .catch(()=>{
        document.getElementById("result").innerHTML = "❌ Server error"
    })
}


// TEST DATA 
function addTestData(){

fetch("http://127.0.0.1:3000/hospital/update",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
        name:"City Hospital",
        lat:25.4358,
        lng:81.8463,
        beds:20
    })
})

fetch("http://127.0.0.1:3000/hospital/update",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
        name:"Apollo Hospital",
        lat:25.45,
        lng:81.86,
        beds:10
    })
})

alert("Added")
}