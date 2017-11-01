//ITLS.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.


// CLASSES DA ÁRVORE--------------------------------------------------------- //
var OP = {
    
    operators : ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"],
    
    length : 8,

    nextN : function(op, n){
        var operators = ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"];
    
        return (operators[ (operators.indexOf(op)+n)%operators.length ]);
    },

    rndOp : function(){
        var operators = ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"];
        
        return (operators[Math.floor(Math.random() * (0 - 7 + 1)) + 7]);
    },

    solve : function(op, value){
        switch (op){
            case "id": //identidade
                return value;
            case "sin": //seno
                return Math.sin(value);
            case "cos": //cosseno
                return Math.cos(value);
            case "tan": //tangente
                return Math.tan(value);
            case "abs": //módulo
                return Math.abs(value);
            case "sqrt": //raiz quadrada
                return value<=0? 0 : Math.sqrt(value);
            case "exp": //exponencial
                return Math.exp( Math.floor(value) );
            case "log": //log 
                return Math.log(value);
            default:
                alert("PROBLEMA EM SOLVE OPERATOR");
        }
    }
}

var TERM = function(exponents, operation){

    this.exp = exponents;
    this.op = operation;

    this.evaluate = function(DataPoint){
        var value = 1.0;

        for(var i=0; i<DataPoint.x.length; i++){
            value *= Math.pow(DataPoint.x[i], this.exp[i]);
        }

        return OP.solve(this.op, value);
    },

    this.getTERM_d = function(){

        //retorna uma string contendo a expressão.

        var expression = this.op + "(";
        for(var i=0; i<this.exp.length; i++){
            expression += "x" + i + "^" + this.exp[i] + (i<this.exp.length-1? " * " : "");
        }
        return expression + ")";
    },

    this.getOp = function(){
        return this.op;
    },

    this.getExp = function(index){
        return index>=this.exp.length? 0 : this.exp[index];
    },

    this.getSize = function(){
        return this.exp.length;
    },

    this.setOp = function(op){
        this.op = op;
    },

    this.shiftOp = function (){
        this.op = OP.nextN(this.op, 1);
    },

    this.setExp = function(index, value){
        if (index<this.exp.length) this.exp[index] = value;
    },

    this.increaseExp = function (index, value){
        if (index<this.exp.length) this.exp[index] += value;
    }
};

var Expression = function(termsToUse){

    //expressão completa, composta por "size" expressões pequenas
    this.coefficients = [ ];
    this.TERMS = termsToUse;
    this.score = 0;

    for (var i=0; i<this.TERMS.length; i++){
        this.coefficients.push(1.0);
    }

    this.adjustCoefficients = function(inputPoints, numIterations){

        var iteration = -1;
        var alpha = 0.01/inputPoints.length;
        var prevError = 0;

        //numero de iterações
        while(++iteration<numIterations){

            for (var i=0; i<inputPoints.length; i++){
                var guess = 0.0;

                for (j=0; j<this.TERMS.length; j++){
                    guess += this.TERMS[j].evaluate(inputPoints[i])*this.coefficients[j];
                }

                var error = inputPoints[i].y - guess;

                for (var j=0; j<this.TERMS.length; j++){
                    
                    //ajustes dos learningRates
                    this.coefficients[j] += alpha*this.TERMS[j].evaluate(inputPoints[i])*error;
                }

                if ( Math.abs(prevError-error)<0.0001)
                    return;
                else
                    prevError = error;
            }
        }

        //limpando os nan
        for(var i=0; i<this.coefficients.length; i++){
            if (isNaN(this.coefficients[i])){
                this.coefficients[i] = 0.0;
            }
        }
    };

    this.calculateMAE = function(inputPoints){

        var mae = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<this.coefficients.length; j++){
                aux+= this.coefficients[j]*this.TERMS[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }
        mae = mae/inputPoints.length;

        if (isFinite(mae))
            this.score = 1/ (1+ mae);
        else 
            this.score = 0.0;
        
        return mae;
    };

    this.getExpression_d = function(){

        //retorna uma string da expressão

        var expression = "";
        for(var i=0; i<this.coefficients.length; i++){
            expression += this.coefficients[i].toFixed(2) + "*" + this.TERMS[i].getTERM_d() + (i<this.size-1? "+" : "");
        }

        return expression;
    },

    this.getScore = function(){
        return this.score;
    },

    this.evaluate = function(inputPoints){

        //para avaliar é preciso ajustar os coeficientes e calcular o novo mse.

        this.adjustCoefficients(inputPoints, 10000);
        this.calculateMAE(inputPoints);

        return this.score;
    },

    this.localSearch = function(inputPoints){

        //local search nos operadores:
        //faz um shift entre os operadores (8 operadores no total)

        

        //percorre todas as mini expressões
        for (var i=0; i<this.TERMS.length; i++){

            var previousScore = this.score; //valor anterior
            var bestOp = this.TERMS[i].getOp(); //operador
            var bestExp; //expoente

            //é só uma operação por miniexpressão, mas a pesquisa deve
            //abrangir todos os operadores possíveis
            for(var j=0; j<OP.length; j++){
                //percorre cada um dos operadores buscando um novo melhor
                this.TERMS[i].shiftOp();
                this.evaluate(inputPoints);

                if (this.score > previousScore){
                    bestOp = this.TERMS[i].getOp();
                    previousScore = this.score;
                }
            }
            
            //atualiza o mse do local search para efetuar nos expoentes
            this.TERMS[i].setOp(bestOp);
            this.evaluate(inputPoints);
            previousScore = this.score;

            //local search entre os exp (são vários exp por cada mini
            //expressão:
            for (var j=0; j<this.TERMS[0].getSize(); j++){

                bestExp = this.TERMS[i].getExp(j);

                //aumenta 1 no original e calcula
                this.TERMS[i].increaseExp(j, 1);
                this.evaluate(inputPoints);
                if (this.score > previousScore){
                    bestExp = this.TERMS[i].getExp(j);
                    previousScore = this.score;
                }

                //diminui 1 no original e calcula
                this.TERMS[i].increaseExp(j, -2);
                this.evaluate(inputPoints);

                if (this.score > previousScore){
                    bestExp = this.TERMS[i].getExp(j);
                    previousScore = this.score;
                }

                this.TERMS[i].setExp(j, bestExp);
                this.evaluate(inputPoints);
            }
        }
    }
};

var Population = function(populationSize, expressionSize, numberOfVariables){

    //"gerenciadora" da população

    this.subjects = [ ];
    this.size = populationSize;

    for(var i=0; i<this.size; i++){
        this.subjects.push(new Expression(rndTerms(expressionSize)));
        if (i==(this.size/2)) expressionSize++;
    }

    //aqui chama o ajuste de coeficientes e calculo do mse
    for(var i=0; i<this.size; i++){
        this.subjects[i].evaluate(inputPoints);
    }

    this.theBest = this.subjects[0];

    this.findBestExpression = function(){
        //pega a melhor expressão da pop (a com o menor mse)
        
        for(var i=0; i<this.size; i++){
            if(this.subjects[i].getScore() > this.theBest.getScore())
                this.theBest = this.subjects[i];
        }
    };

    this.getBestExpression_d = function(){
        return this.theBest.getExpression_d();
    },

    this.getBestExpressionScore_d = function(){
        return this.theBest.getScore();
    },

    this.evaluate = function(){
        
        //chama os métodos de todos os individuos

        for(var i=0; i<this.size; i++){
            this.subjects[i].evaluate(inputPoints);
        }
    },

    this.localSearch = function(inputPoints){
        for(var i=0; i<this.size; i++){
            this.subjects[i].localSearch(inputPoints);
            this.subjects[i].evaluate(inputPoints);
        }
    },

    this.localSearchBestExpression = function(inputPoints){

        //executa o local search, mas só no melhor indivíduo, e não
        //na pop inteira.
        this.theBest.localSearch(inputPoints);
    }
};


// MÉTODOS AUXILIARES---------------------------------------------------------------- //

function rndTerms(howMany){

    //conjunto de termos (que são conjuntos de expoentes)

    var terms = [ ];

    for (var i=0; i<howMany; i++){
        var aux = [ ];
        for (var i=0; i< inputPoints[0].x.length; i++){
            aux.push( Math.floor(Math.random()*4) );
        }
        terms.push(new TERM(aux, OP.rndOp()));
    }

    return terms;
}
// -------------------------------------------------------------------------- //

function run_ITLS(){

    if (inputPoints[0]==undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

	//cria uma nova população
	var myPop = new Population(20, 1, inputPoints[0].x.length);
    myPop.evaluate(inputPoints); 

    myPop.findBestExpression();

    //imprime informação no canvas
    document.getElementById("results").innerHTML="<p>População criada. A melhor expressão inicial:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";

    if (myPop.getBestExpressionScore_d()>=0.999999){
        return;
    }

    var prevScore;
    var counter = 0;

    //O algoritmo só para quando uma busca local nova não modificar o valor do MSE.

    do {
        prevScore = myPop.getBestExpressionScore_d();
        myPop.localSearchBestExpression(inputPoints, 7);
    }while (prevScore !=myPop.getBestExpressionScore_d() || counter++>75);

    document.getElementById("results").innerHTML+="<p>O algoritmo executou "+(counter++)+" buscas locais, e o resultado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";
}
