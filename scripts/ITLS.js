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

var MiniExpression = function(numberOfVariables){

    //expressão pequena. recebe um dataPoint para tomar como parâmetro na hora de ajustar suas variáveis internas.

    //construtor:

    //inicialização das variáveis (variáveis são privadas)
    this.size = numberOfVariables;
    this.exponents = [ ];
    this.operation = OP.rndOp();

    for(var i=0; i<this.size; i++){
        this.exponents.push(1);
    }

    this.getMiniExpression_d = function(){

        //retorna uma string contendo a expressão.

        var expression = this.operation + "(";
        for(var i=0; i<this.size; i++){
            expression += "x" + i + "^" + this.exponents[i] + (i<this.size-1? " * " : "");
        }
        return expression + ")";
    },

    this.getSize = function(){
        return this.size;
    },

    this.getOp = function(){
        return this.operation;
    },

    this.setOp = function(op){
        this.operation = op;
    },

    this.shiftOp = function (){
        
        //faz um shift no operador, útil para a busca local.
        this.operation = OP.nextN(this.operation, 1);
    },

    this.evaluate = function(DataPoint){

        //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

        var value = 1.0;

        for(var i=0; i<DataPoint.x.length; i++){
            value *= Math.pow(DataPoint.x[i], this.exponents[i]);
        }

        return OP.solve(this.operation, value);
    },

    this.getExp = function(index){
        //out of range
        if (index>=this.size)
            return 0;
        return this.exponents[index];
    },

    this.setExp = function(index, value){
        //out of range
        if (index>=this.size){
            return 0;
        }
        this.exponents[index] = value;
    },

    this.increaseExp = function (index, value){

        //out of range
        if (index>=this.size)
            return 0;
            this.exponents[index] += value;
    }
};

var Expression = function(expressionSize, numberOfVariables){

    //expressão completa, composta por "size" expressões pequenas

    //construtor:

    //membros privados
    this.size = expressionSize;
    this.coefficients = [ ];
    this.equation = [ ];
    
    //esses membros são de interesse externo
    this.mse = Math.exp(300);
    this.expressionValue = 0.0;

    for (var i=0; i<this.size; i++){
        this.equation.push(new MiniExpression(numberOfVariables));
        this.coefficients.push(1.0);
    }

    this.adjustCoefficients = function(inputPoints, numIterations){

        var iteration = -1;
        var alpha = 0.01/inputPoints.length;

        //numero de iterações
        while(++iteration<numIterations){

            for (var i=0; i<inputPoints.length; i++){
                var guess = 0.0;

                for (j=0; j<this.equation.length; j++){
                    guess += this.equation[j].evaluate(inputPoints[i])*this.coefficients[j];
                }

                var error = inputPoints[i].y - guess;

                for (var j=0; j<this.equation.length; j++){
                    
                    //ajustes dos learningRates
                    this.coefficients[j] += alpha*this.equation[j].evaluate(inputPoints[i])*error;
                }
            }
        }
    };

    this.calculateMse = function(inputPoints){

        //calcula o mse.
        this.mse = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<this.size; j++){
                aux+= this.coefficients[j]*this.equation[j].evaluate(inputPoints[i]);
            }
            this.mse += Math.pow(inputPoints[i].y - aux, 2);
        }
        this.mse = Math.sqrt(this.mse/inputPoints.length);

        if (!isFinite(this.mse) || isNaN(this.mse))
            this.mse = Math.exp(300);
    };

    this.getExpression_d = function(){

        //retorna uma string da expressão

        var expression = "";
        for(var i=0; i<this.size; i++){
            expression += this.coefficients[i].toFixed(2) + "*" + this.equation[i].getMiniExpression_d() + (i<this.size-1? "+" : "");
        }

        return expression;
    },

    this.getMse = function(){
        return this.mse;
    },

    this.evaluate = function(inputPoints){

        //para avaliar é preciso ajustar os coeficientes e calcular o novo mse.

        this.adjustCoefficients(inputPoints, 1500);
        this.calculateMse(inputPoints);

        return this.mse;
    },

    this.localSearch = function(inputPoints, numberOfOperators){

        //local search nos operadores:
        //faz um shift entre os operadores (8 operadores no total)

        //percorre todas as mini expressões
        for (var i=0; i<this.size; i++){

            var previousMse = this.mse; //valor anterior
            var bestOp = this.equation[i].getOp(); //operador
            var bestExp; //expoente

            //é só uma operação por miniexpressão, mas a pesquisa deve
            //abrangir todos os operadores possíveis
            for(var j=0; j<numberOfOperators; j++){
                //percorre cada um dos operadores buscando um novo melhor
                this.equation[i].shiftOp();
                this.evaluate(inputPoints);

                if (this.mse < previousMse){
                    bestOp = this.equation[i].getOp();
                    previousMse = this.mse;
                }
            }
            
            //atualiza o mse do local search para efetuar nos expoentes
            this.equation[i].setOp(bestOp);
            this.evaluate(inputPoints);
            previousMse = this.mse;

            //local search entre os exp (são vários exp por cada mini
            //expressão:
            for (var j=0; j<this.equation[0].getSize(); j++){

                bestExp = this.equation[i].getExp(j);

                //aumenta 1 no original e calcula
                this.equation[i].increaseExp(j, 1);
                this.evaluate(inputPoints);
                if (this.mse < previousMse){
                    bestExp = this.equation[i].getExp(j);
                    previousMse = this.mse;
                }

                //diminui 1 no original e calcula
                this.equation[i].increaseExp(j, -2);
                this.evaluate(inputPoints);
                if (this.mse < previousMse){
                    bestExp = this.equation[i].getExp(j);
                    previousMse = this.mse;
                }

                this.equation[i].setExp(j, bestExp);
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
        this.subjects.push(new Expression(expressionSize, numberOfVariables));
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
            if(this.subjects[i].getMse() <= this.theBest.getMse())
            this.theBest = this.subjects[i];
        }
    };

    this.getBestExpression_d = function(){
        this.findBestExpression();
        return this.theBest.getExpression_d();
    },

    this.getBestExpressionMse_d = function(){
        return this.theBest.getMse();
    },

    this.evaluate = function(){
        
        //chama os métodos de todos os individuos

        for(var i=0; i<this.size; i++){
            this.subjects[i].evaluate(inputPoints);
        }
    },

    this.localSearch = function(inputPoints, numberOfOperators){
        for(var i=0; i<this.size; i++){
            this.subjects[i].localSearch(inputPoints, numberOfOperators);
            this.subjects[i].evaluate(inputPoints);
        }
    },

    this.localSearchBestExpression = function(inputPoints, numberOfOperators){

        //executa o local search, mas só no melhor indivíduo, e não
        //na pop inteira.
        this.findBestExpression();
        this.theBest.localSearch(inputPoints, numberOfOperators);
        //theBest.evaluate(inputPoints); acho que isso está redundante!!!
    }
};


// -------------------------------------------------------------------------- //

function run_ITLS(){

	//cria uma nova população
	var myPop = new Population(100, 1, inputPoints[0].x.length);
    myPop.evaluate(inputPoints); 

    //imprime informação no canvas
    document.getElementById("results").innerHTML="<p>População criada. O melhor da primeira pop:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>MSE: "+myPop.getBestExpressionMse_d()+"</p>";

    var lastMSE;
    var counter = 0;

    //O algoritmo só para quando uma busca local nova não modificar o valor do MSE.

    do {
        lastMSE = myPop.getBestExpressionMse_d();
        myPop.localSearchBestExpression(inputPoints, 7);
    }while (lastMSE !=myPop.getBestExpressionMse_d() || counter++>100);

    document.getElementById("results").innerHTML+="<p>O algoritmo executou "+(counter++)+" buscas locais, e o resultado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>MSE: "+myPop.getBestExpressionMse_d()+"</p>";
}
