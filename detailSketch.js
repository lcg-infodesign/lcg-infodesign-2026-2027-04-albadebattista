let data; 
let select = 0;
let xMidPage; //centro della pagina in larghezza
let yMidPage; //centro della pagina in altezza
let maxG = 0;

//riassegno i colori dei brand
const colors = {
  "American Home Food Products": "#c3b108",
  "General Mills":  "#f64113",
  "Kelloggs": "#f9988d",
  "Nabisco": "#04a4ab",
  "Post": "#feb603",
  "Quaker Oats": "#8379bf",
  "Ralston Purina": "#fa9400",
};

async function setup() {
    createCanvas(windowWidth, windowHeight);
    data = await loadTable("assets/cereal.csv", ",", "header");

    let params = getURLParams();
    select = int(params.cereal_id);

    for (let r = 0; r < data.getRowCount(); r++) {
        maxG = max(maxG,
            data.getNum(r, "protein"),
            data.getNum(r, "fat"),
            data.getNum(r, "fiber"),
            data.getNum(r, "carbo"),
        );
    }
}

//funzione per disegnare il singolo cereale (identica a quella usata nella pagina index)
function drawCereal(cx, cy, w, h, angle, col) {
  push();
  translate(cx, cy);
  rotate(angle);

  stroke(0,30);
  strokeWeight(2);
  fill(col);
  ellipse(0, 0, w, h);

  fill("#f1e4cc");           
  ellipse(0, 0, w * 0.4, h * 0.4);
  pop();
}

//funzione che li dispone nella metà della tazza
function drawCereals(cx, cy) {
    const radius = 250; //metà del cerchio di latte (500)
    const w = 30; //larghezza del singolo cereale
    const h = w * 0.85; //altezza del singolo cereale
    const col = colors[data.getString(select, "mfr")]; //assegna il colore corrispondente alla marca (lo stesso della pagina index)

    randomSeed(select);
    let row = 0; 
    for (let py = cy - radius; py < cy + radius; py += h * 0.8) { //scorro dall'alto verso il basso
        let shift = (row % 2) * (w / 2); //crea un leggero sfasamento orizzontale
        for (let px = cx - radius; px < cx - w / 2; px += w) { //scorro da sinistra verso la metà della ciotola
            let cerealX = px + shift;
            if (Math.sqrt(Math.pow(cerealX - cx, 2) + Math.pow(py - cy, 2)) < radius - w / 2) { //uso il teorema di pitagora per calcolare la distanza del singolo cereale dal centro della tazza, se minore del raggio significa che i cereali sono posizionati all'interno del latte 
                drawCereal(cerealX, py, w, h, random(-PI / 2, PI / 2), col);
            }
        }
        row++;
    }
}

//funzione che disegna la ciotola 
function drawBowl(x, y) {
    //profilo esterno
    noStroke(); 
    fill("#435e06"); 
    circle(x, y, 650);
    //bordino
    noFill(); 
    stroke("#f1e4cc"); 
    strokeWeight(6);  
    circle(x, y, 610);
    //latte
    noStroke(); 
    fill("#f1e4cc");
    circle(x, y, 500);
}
function drawNutrition(cx,cy) {
    const nutrients = ["protein", "fat", "fiber", "carbo"];

    const marginLeft = cx + 8; //distanza da sinistra da cui partire
    const barW = 180; //lunghezza della barra
    const barH = 12; //altezza della barra
    const step = 50; //distanza tra barre
    const marginTop = cy-60; //distanza dall'alto

    textFont("monospace");
    textSize(14);
    textStyle(NORMAL);
    noStroke();

    for (let i = 0; i < nutrients.length; i++) { //faccio scorrere le 4 colonne 
        const name = nutrients[i]; //estraggo 3 variabili dall'array 
        const val = data.getNum(select, name);
        const y = marginTop + i * step; //da dove parte la singola barra

        fill("#435e06");
        textAlign(LEFT, BOTTOM);
        text(name, marginLeft, y); //nome della categoria
        textAlign(RIGHT, BOTTOM);
        text(val + "g", marginLeft + barW, y); //valore + unità di misura

        //barra sotto in trasparenza
        fill(67, 94, 6, 40);
        rect(marginLeft, y + 3, barW, barH, barH / 2);

        const length = map(val, 0, maxG, 0, barW);
        //barra valore
        fill("#435e06");
        rect(marginLeft, y + 3, length, barH, barH / 2);
    }
}

function drawCalories(cx,cy) {
    const calories = data.getString(select, "calories");

    //scritta calorie in alto 
    noStroke();
    fill("#435e06"); 
    textAlign(LEFT, CENTER);
    textFont("monospace"); 
    textStyle(BOLD);
    textSize(52);
    text(calories, cx+8, cy - 130);
    //sottotitolo
    textSize(14);
    textStyle(NORMAL);
    text("calories", cx+100, cy - 120);
}

//funzione per scivere in alto il nome del cereale che stiamo considerando
function drawName(cx, cy) {
    const name = data.getString(select, "name");

    noStroke();
    fill("#435e06");
    textFont("monospace");
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    textSize(30);
    text(name, cx, cy - 350);
}

function draw() {
    background('#f6e097');
    xMidPage = windowWidth/2;
    yMidPage = windowHeight/2;

    drawBowl(xMidPage,yMidPage);  
    drawCereals(xMidPage,yMidPage);
    drawCalories(xMidPage,yMidPage);
    drawName(xMidPage, yMidPage);
    drawNutrition(xMidPage,yMidPage);
}