//regressão simbólica com "genética de bactérias", utilizando apenas polinômios


//DATA POINT--------------------------------------------------------------------
var DataPoint = function(x, y){
    this.x = x;
    this.y = y;
}


//CLASSE POLINOMIO--------------------------------------------------------------
var Polinomio = function() {
    //aqui é o construtor
    this.expoentes = [];
    this.coeficientes = [];
    this.mse = 0.0;

    //crio o numero máximo de termos, mas no eval eu cuido apenas da quantidade selecionada
    for (var i=0; i<10; i++) {
        this.expoentes.push(Math.floor( Math.random()*(grau+1) ) );
        this.coeficientes.push( (Math.random()>0.5 ? 1 : -1)*Math.random()*constantRange );
    }
}

//IMPLEMENTAÇÃO POLINOMIO-------------------------------------------------------
Polinomio.prototype.eval = function(x) {
    var f = 0;
    
    for (var i=0; i<termos; i++){
        f += Math.pow( this.coeficientes[i]*x, this.expoentes[i] );
    }
    return f;
}

Polinomio.prototype.evalMSE = function(points){
    var mse = 0.0;

    for (var i=0; i<points.length; i++){
        mse += Math.pow( (this.eval(points[i].x)-points[i].y), 2 );
    }
    mse = Math.sqrt( mse/points.length );

    this.mse = mse;
}

Polinomio.prototype.mutate = function(rate){
    for (var i=0; i<termos; i++){
        if ( Math.random() < rate ){
            this.expoentes[i] =  Math.floor( Math.random()*(grau+1) ) ;
        }
        if ( Math.random() < rate ){
            this.coeficientes[i] += (Math.random()>0.5 ? 1 : -1)*Math.random()*constantRange;
        }
    }
}

Polinomio.prototype.getCopy = function(){
    //copia todos os dados para um novo obj
    aux = new Polinomio();
    aux.mse = this.mse;
    for (var i=0; i<termos; i++){
        aux.coeficientes[i] = this.coeficientes[i];
        aux.expoentes[i] = this.expoentes[i];
    }
    return aux;
}


//"MAIN"------------------------------------------------------------------------

//variaveis do canvas
var canvas;
var ctx;

//variaveis containers
var population = [];
var selectedpopulation = [];    
var Points = [];

//variaveis da evolução (não mutáveis)
var popSize = 50;
var grau = 2;

//variaveis que podem ser alteradas durante execuçãos
var mutateRate = 0.15;
var constantRange = 10;
var termos = 3;

//setup
function canvas_setup(){

    //setup canvas
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.font = "12px sans-serif";

    //dados para busca
    Points.push(new DataPoint(0, 1));
    Points.push(new DataPoint(1, 2));
    Points.push(new DataPoint(2, 4));
    Points.push(new DataPoint(3, 8));
    Points.push(new DataPoint(4, 16));
    Points.push(new DataPoint(5, 32));

    //população inicial
    for (var i=0; i<popSize; i++) {
        //preenche a população inicial
        population.push(new Polinomio());
    }

    //animação da evolução
    setInterval(function() { evolution(); }, 50);
}

function evolution(){

        mutateRate = document.getElementById("nMutateRate").value;
        constantRange = document.getElementById("nConstRate").value;
        termos = document.getElementById("nTerms").value;
        grau = document.getElementById("nGrau").value;

        for(var i=0; i<popSize; i++){
            //calcula o mse da população inicial
            //também esvazia a população selecionada, caso esteja cheia
            population[i].evalMSE(Points);
            selectedpopulation.shift();
        }

        //encontrando o melhor pra imprimir na tela
        var bestMse = population[0];

        for(var i=1; i<popSize; i++){
            if (population[i].mse < bestMse[i])
                bestMse = population[i].getCopy();
        }

        //imprimindo o polinomio na tela
        var equation = "";
        for (var i=0; i<termos; i++){
            equation += Number(bestMse.coeficientes[i]).toFixed(3)+"x^"+bestMse.expoentes[i]+
            (i<termos-1 ? bestMse.coeficientes[i+1]>0 ? " +" : " " : " ");
        }
        ctx.clearRect(0, 0, 600, 600);
        ctx.fillText(equation, 25, 25);
        ctx.fillText("MSE: \t" + Number(bestMse.mse).toFixed(2), 25, 50);

        //seleção
        for (var i=0; i<popSize; i++){
            //seleção por torneio, jogando cópias dos vencedores na população selecionada
            var i1 = Math.floor( Math.random()*popSize );
            var i2 = Math.floor( Math.random()*popSize );
            selectedpopulation.push( population[i1].mse>population[i2].mse ? population[i2].getCopy() : population[i1].getCopy() );
        }

        //mutação
        for(var i=0; i<popSize; i++){
            //mutaciona a população selecionada, atualiza seus mses e copia ela para a população original.
            selectedpopulation[i].mutate(mutateRate);
            selectedpopulation[i].evalMSE(Points);
            population.shift();        
            population.push(selectedpopulation[i].getCopy());
        }
}