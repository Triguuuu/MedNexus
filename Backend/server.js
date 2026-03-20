const Hospital = require("./models/Hospital")
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
app.use(cors())
app.use(express.json())

// CONNECT DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/mednexus")
.then(()=>console.log(" MongoDB Connected"))
.catch(err=>console.log(err))


// REGISTER
app.post("/register", async (req, res) => {

    const { name, email, password, lat, lng } = req.body

    const hashed = await bcrypt.hash(password, 10)

    const hospital = new Hospital({
        name,
        email,
        password: hashed,
        lat,
        lng,
        beds: 0
    })

    await hospital.save()

    res.json({ success: true })
})


//  LOGIN
app.post("/login", async (req, res) => {

    const { email, password } = req.body

    const hospital = await Hospital.findOne({ email })

    if(!hospital) return res.json({ success:false })

    const valid = await bcrypt.compare(password, hospital.password)

    if(!valid) return res.json({ success:false })

    res.json({ success:true, id: hospital._id })
})


//  UPDATE BEDS
app.post("/update-beds", async (req, res) => {

    const { id, beds } = req.body

    await Hospital.findByIdAndUpdate(id, { beds })

    res.json({ success: true })
})


//  GET ALL HOSPITALS
app.get("/hospitals", async (req, res) => {

    const hospitals = await Hospital.find()

    res.json(hospitals)
})


//  EMERGENCY (same logic)
app.post("/emergency", async (req, res) => {

    const { lat, lng } = req.body

    const hospitals = await Hospital.find()

    function getDistance(lat1, lon1, lat2, lon2){
        const R = 6371
        const dLat = (lat2-lat1) * Math.PI/180
        const dLon = (lon2-lon1) * Math.PI/180

        const a =
        Math.sin(dLat/2)*Math.sin(dLat/2)+
        Math.cos(lat1*Math.PI/180)*
        Math.cos(lat2*Math.PI/180)*
        Math.sin(dLon/2)*Math.sin(dLon/2)

        const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
        return R*c
    }

    let bestHospital = null
    let bestScore = -Infinity

    hospitals.forEach(h => {

        const distance = getDistance(lat, lng, h.lat, h.lng)
        const score = h.beds - distance

        if(score > bestScore){
            bestScore = score
            bestHospital = {
                name: h.name,
                distance: distance
            }
        }
    })

    res.json({ success:true, hospital: bestHospital })
})

app.post("/hospital/update", async (req, res) => {

    const { name, lat, lng, beds } = req.body

    let hospital = await Hospital.findOne({ name })

    if(hospital){
        hospital.beds = beds
        hospital.updatedAt = Date.now()
        await hospital.save()
    } else {
        hospital = new Hospital({ name, lat, lng, beds })
        await hospital.save()
    }

    res.json({ success: true })
})


app.listen(3000, ()=>{
    console.log(" Server running on http://127.0.0.1:3000")
})