const Input = document.querySelector('.icgFile');
const Button = document.querySelector('.ReadFile');
const flightStart = document.querySelector('.start-flight')
const flightEnd = document.querySelector('.end-flight')
const flightTime = document.querySelector('.flight-time')
const pilotName = document.querySelector('.pilot-name')
const gliderType = document.querySelector('.glider-type')
const FlightDate = document.querySelector('.flight-date')
const flightLength = document.querySelector('.flight-length')
const minHeight = document.querySelector('.min-height')
const maxHeight = document.querySelector('.max-height')
const FlightDistance = document.querySelector('.flight-distance')
const FlightSpeed = document.querySelector('.flight-speed')

let value = ''
const tab = []
const TimeValue = []
const Latitude = []
const Longitude = []
const cords = []
const firstAndLast = []
const altitudes = []
const time = []


Input.addEventListener('blur', (e)=>{
    value = e.target.value
})

const fetchData = () =>{
    if(value !== ''){
        fetch(`${value}`)
        .then(function(response){
            return response.text();
        })
        .then(function(data){
            const splitData = data.split(/\n|\;/)
            tab.push(...splitData)
            getTime()
            getFlightDetails()
            getLocation()
            getDistance(firstAndLast)
            getHeight()
            flightDistance(cords)
        })
        .catch(function(error){
            console.error(error)
        })
    }
}

const getTime = ()=>{

    tab.forEach((el)=>{
        if(el.startsWith('B') && el.length>35){
            let Time = el.substring(1, 7);
            const parts = Time.match(/.{1,2}/g);
            const FixedTime = parts.join(':');
            TimeValue.push(FixedTime)
        }
    })
    const beginningFlight = TimeValue[0]
    const endFlight = TimeValue[TimeValue.length - 1]
    const firstFlight = beginningFlight.split(':').reduce(function(seconds, v){
        return +v + seconds * 60;
    }, 0) /60;
    const lastFlight = endFlight.split(':').reduce(function(seconds, v){
        return +v + seconds * 60;
    }, 0) /60;
    const flightLength = lastFlight - firstFlight
    const hours = Math.floor(flightLength / 60);
    const minutes = (flightLength % 60).toFixed(0)

    time.push(flightLength)
    flightStart.innerHTML = `${`Czas startu lotu: ${beginningFlight}`}`
    flightEnd.innerHTML = `${`Czas końca lotu: ${endFlight}`}`
    flightTime.innerHTML= `${`Czas lotu wynosił: ${hours+'h i '+minutes+'m'}`}`
}


const getFlightDetails = () =>{
    tab.forEach((el)=>{
        if(el.startsWith('HOPLTPILOT:')){
            let Name = el.substring(11);
            pilotName.innerHTML = `${`Pilot: ${Name}`}`
        }
        if(el.startsWith('HFPLTPILOTINCHARGE:')){
            let Name = el.substring(19);
            pilotName.innerHTML = `${`Pilot: ${Name}`}`
        }
        if(el.startsWith('HOGTYGLIDERTYPE:')){
            let GliderType = el.substring(16);
            gliderType.innerHTML = `${`Typ glidera: ${GliderType}`}`
        }
        if(el.startsWith('HFGTYGLIDERTYPE:')){
            let GliderType = el.substring(16);
            gliderType.innerHTML = `${`Typ glidera: ${GliderType}`}`
        }
        if(el.startsWith('HFDTE')){
            let flightDate = el.substring(5);
            let parts = flightDate.match(/.{1,2}/g);
            let FixedDate = parts.join('-')
            FlightDate.innerHTML = `${`Data lotu: ${FixedDate}`}`

        }
        if(el.startsWith('HFDTEDATE:')){
            let flightDate = el.substring(10, 16);
            let parts = flightDate.match(/.{1,2}/g);
            let FixedDate = parts.join('-');
            FlightDate.innerHTML = `${`Data lotu: ${FixedDate}`}`

        }
    })


}

const getLocation = () =>{
    tab.forEach((el)=>{
        if(el.startsWith('B') && el.length>35){
            let lat1 = el.substring(7, 9)
            let lat2 = el.substring(9, 14)
            let long1 = el.substring(15, 18)
            let long2 = el.substring(18, 23)
            let lat = lat1+'.'+lat2;
            let FixedLat = parseFloat(lat)
            let long = long1+'.'+long2;
            let FixedLong = parseFloat(long)
            cords.push({
                lat: FixedLat,
                lng: FixedLong,
            })
        }
    })
    
    const firstPoint = cords[0];
    firstAndLast.push(firstPoint)
    const lastPoint = cords[cords.length - 1];
    firstAndLast.push(lastPoint)

    initMap(cords)
}

const getDistance = (firstAndLast) => {
    
    //CALCULATE DISTANCE FROM FIRST LOCATION TO LAST LOCATION
    const lat1 = firstAndLast[0].lat
    const lat2 = firstAndLast[1].lat
    const lon1 = firstAndLast[0].lng
    const lon2 = firstAndLast[1].lng
    const R = 6371e3;
    const phi1 = lat1 * Math.PI/180
    const phi2 = lat2 * Math.PI/180

    const dphi1 = (lat1 - lat2) * Math.PI/180
    const dphi2 = (lon2 - lon1) * Math.PI/180

    const a =   Math.sin(dphi1/2) * Math.sin(dphi1/2) + 
                Math.cos(phi1) * Math.cos(phi2) * 
                Math.sin(dphi2/2) * Math.sin(dphi2/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = parseInt(R * c)
    
    flightLength.innerHTML = `${`Dystans od puntku startu do lądowania to: ${d} metrów`}`

     
}

const flightDistance = (cords) =>{


    let distance = 0;
    for(let i = 1; i<cords.length; i++){
        const lat1 = cords[i - 1].lat
        const lon1 = cords[i - 1].lng
        let lat2 = cords[i].lat
        let lon2 = cords[i].lng
        const R = 6371e3;
        const phi1 = lat1 * Math.PI/180
        const phi2 = lat2 * Math.PI/180
    
        const dphi1 = (lat1 - lat2) * Math.PI/180
        const dphi2 = (lon2 - lon1) * Math.PI/180
    
        const a =   Math.sin(dphi1/2) * Math.sin(dphi1/2) + 
                    Math.cos(phi1) * Math.cos(phi2) * 
                    Math.sin(dphi2/2) * Math.sin(dphi2/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = parseInt(R * c)
        distance += d;
    }
 
    const fixedDistance = (distance*0.001).toFixed(2)
    
    let Time = time[0]/60;
    let Speed = (fixedDistance / Time).toFixed(2)
    FlightDistance.innerHTML = `${`Długość całego lotu wynosi ${fixedDistance} km`}`
    FlightSpeed.innerHTML = `${`Średnia prędkość trasy wynosiła: ${Speed} km/h`}`

    
}

const getHeight = () =>{
    tab.forEach((el)=>{
        if(el.startsWith('B') && el.length>35){

        let height = parseInt(el.substring(25,30))
        altitudes.push(height)
    
    }
    })
    altitudes.sort(compare)
    minHeight.innerHTML = `${`Minimalna wysokośc: ${altitudes[0]} m n.p.m`}`
    maxHeight.innerHTML = `${`Minimalna wysokośc: ${altitudes[altitudes.length-1]} m n.p.m`}`


}
const initMap = (cords) => {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: cords[0],
      mapTypeId: "terrain",
    }); 
    
    const flightPath = new google.maps.Polyline({
      path: cords,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    flightPath.setMap(map);
    addMarker(cords, map)
  }

  const addMarker = (cords, map) =>{
    new google.maps.Marker({
        position: cords[0],
        label: 'Start',
        map: map,
      });
    new google.maps.Marker({
        position: cords[cords.length-1],
        label: 'Stop',
        map: map,
      });
  }
Button.addEventListener('click', ()=>{
    fetchData()
})

//REUSABLE FUNCTIONS

const compare = (a, b) =>{
    if(a < b){
        return -1
    } 
    if(a > b){
        return 1
    }
    return 0;
}