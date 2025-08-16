const express = require("express")

const app = express()
port=3000

app.get("/",(req,res)=>{
    res.send("<h1>gym id working</h1>")
} )


app.listen(port , ()=>{
    console.log("server running...")
})