//Imports ---------------------------------------------------------------------------------------------------------------------------------------------
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const admin = require('firebase-admin');
//Service account não deve ser subido por versionadores
const serviceAccount = require('./locket/service-account-firebase.json');

//Server configs --------------------------------------------------------------------------------------------------------------------------------------
let app = express();
const port = 8000;

//Files -----------------------------------------------------------------------------------------------------------------------------------------------
const dataPath = './assets/dummy-data.csv';

//Firestore -------------------------------------------------------------------------------------------------------------------------------------------
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://maps-covid-d825c.firebaseio.com"
});

let db = admin.firestore();

// Private --------------------------------------------------------------------------------------------------------------------------------------------
let sendData = (data, res) => {
    try {
        let ref = db.collection('dados-srag').doc('cargas');

        ref.set({
            carga: data
        });


        res.send('Dados carregados');
    } catch (error) {
        console.error(error);
    }
}

let getData = (res) => {
    let dataColection = [];
    fs.createReadStream(dataPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (e) => {
            dataColection.push({ DT_NOTIF: `${e.DT_NOTIFIC}`, COD_CNES: `${e.CO_UNI_NOT}`, CLASS_FINAL: `${e.CLASSI_FIN}`, DT_FIM: `${e.DT_ENCERRA}` })
        })
        .on('end', () => {
            sendData(dataColection, res);
        });
}

let retrieveData = (res) => {
    const snapshot = db.collection('dados-srag').doc('cargas').get().then(data => {

        res.send(data.data());
    });
    // res.send(snapshot.data());
}

//Endpoints -------------------------------------------------------------------------------------------------------------------------------------------
app.get('/health', (req, res) => {
    res.send('200 ok');
});

app.get('/data', (req, res) => {
    getData(res)
})

app.get('/getData', (req, res) => {
    retrieveData(res);
})


//Listen ----------------------------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Rotina iniciada na porta:${port}.`);
});

