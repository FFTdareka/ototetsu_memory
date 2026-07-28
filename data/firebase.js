fetch('data/staData.json')
.then(res => res.json())
.then(f => {
    firebase.initializeApp(f.firebase);
    firebase.analytics();
});
