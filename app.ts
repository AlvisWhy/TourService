const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res)=> {
    res.status(200).json(
        {
            "status": "success",
            "result": tours.length,
            "data": {
                "tours": tours
            }
        }
    )
}

const getTourById = (req, res)=> {

    const id = req.params.id * 1;
    const tour = tours.find(obj =>obj.id === id)
    if(!tour) {
        return res.status(404).json({
            status: "fail",
        });
    }
    res.status(200).json(
        {
            "status": "success",
            "data": {
                tour
            }
        }
    )
}

const addTour = (req, res)=> {
    const newId = tours[tours.length-1].id+1;
    const newTour = Object.assign( {id: newId}, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err=> {
        res.status(201).send({
            status: "success",
            data: {
                tour: newTour
            }
        })
    })
}

app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(addTour)

app
    .route('/api/v1/tours/:id')
    .get(getTourById)


const port = 8000;
app.listen(port, ()=> {
    console.log(`App is running on the port ${port}`);
});