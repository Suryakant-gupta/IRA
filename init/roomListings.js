const roomListings = [
    {
        "id": 1,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "G01",
        "rentPerDay" : 283.3

    },
    {
        "id": 26,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "101",
        "rentPerDay" : 350
    },
    {
        "id": 2,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "G02",
        "rentPerDay" : 283.3

    },
    {
        "id": 27,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "102",
        "rentPerDay" : 350
    },
    {
        "id": 3,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "G03",
        "rentPerDay" : 283.3

    },
    {
        "id": 28,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "103",
        "rentPerDay" : 350
    },
       {
        "id": 4,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "301",
        "rentPerDay" : 283.3

    },
    {
        "id": 29,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "104",
        "rentPerDay" : 350
    },
    {
        "id": 5,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "302",
        "rentPerDay" : 283.3


    },
    {
        "id": 30,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "201",
        "rentPerDay" : 350
    },
    {
        "id": 6,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "303",
        "rentPerDay" : 283.3


    },
    {
        "id": 31,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "202",
        "rentPerDay" : 350
    },
    {
        "id": 7,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "B01",
        "rentPerDay" : 283.3


    },
    {
        "id": 32,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "203",
        "rentPerDay" : 350
    },
    {
        "id": 8,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "B02",
        "rentPerDay" : 283.3


    },
    
    {
        "id": 33,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "204",
        "rentPerDay" : 350
    },
    {
        "id": 9,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "B03",
        "rentPerDay" : 283.3


    },
    {
        "id": 34,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "304",
        "rentPerDay" : 350
    },
    {
        "id": 10,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "B04",
        "rentPerDay" : 283.3


    },
    
    {
        "id": 35,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" : "401",
        "rentPerDay" : 350
    },
    {
        "id": 11,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "101",
        "rentPerDay" : 283.3


    },
    {
        "id": 36,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "402",
        "rentPerDay" : 350
    },
    {
        "id": 12,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["furnished", "shared bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "102",
        "rentPerDay" : 283.3


    },
    {
        "id": 37,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" :"403" ,
        "rentPerDay" : 350
    },
    {
        "id": 13,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "103",
        "rentPerDay" : 283.3


    },
    {
        "id": 38,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" :"404" ,
        "rentPerDay" : 350
    },
    {
        "id": 14,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "104",
        "rentPerDay" : 283.3


    },
    {
        "id": 39,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" : "501",
        "rentPerDay" : 350
    },
    {
        "id": 15,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "201",
        "rentPerDay" : 283.3


    },
    {
        "id": 40,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4077,
        "roomNumber" : "502",
        "rentPerDay" : 350
    },
    {
        "id": 16,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "202",
        "rentPerDay" : 283.3


    },
    {
        "id": 41,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4077,
        "roomNumber" :"503" ,
        "rentPerDay" : 350
    },
    {
        "id": 17,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "203",
        "rentPerDay" : 283.3


    },
    {
        "id": 42,
        "name": "Premium Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": true,
        "price": 10500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4077,
        "roomNumber" :"504" ,
        "rentPerDay" : 350
    },
    {
        "id": 18,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "204",
        "rentPerDay" : 283.3


    },
    {
        "id": 43,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "205",
        "rentPerDay" : 283.3


    },
    {
        "id": 19,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "301",
        "rentPerDay" : 283.3


    },
    {
        "id": 20,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "302",
        "rentPerDay" : 283.3


    },
    {
        "id": 21,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "303",
        "rentPerDay" : 283.3


    },
    {
        "id": 22,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "304",
        "rentPerDay" : 283.3


    },
    {
        "id": 23,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "305",
        "rentPerDay" : 283.3


    },
    {
        "id": 24,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "401",
        "rentPerDay" : 283.3


    },
    {
        "id": 25,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room1.png",
        "buildingNumber" : 4079,
        "roomNumber" : "402",
        "rentPerDay" : 283.3


    },
   
    {
        "id": 44,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room2.png",
        "buildingNumber" : 4079,
        "roomNumber" : "403",
        "rentPerDay" : 283.3


    },
    {
        "id": 45,
        "name": "Standard Rooms",
        "type": "single-room",
        "location": "Delhi",
        "ac": false,
        "price":8500,
        "availability": "available",
        "amenities": ["fully furnished", "private bathroom"],
        "image": "/assets/images/room3.png",
        "buildingNumber" : 4079,
        "roomNumber" : "404",
        "rentPerDay" : 283.3


    },
    
];


module.exports = {roomListings : roomListings}