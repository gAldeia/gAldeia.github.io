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
    var size = numberOfVariables;
    var exponents = [ ];
    var operation = OP.rndOp();

    for(var i=0; i<size; i++){
        exponents.push(1);
    }

    //métodos públicos
    return {
        getMiniExpression_d : function(){

            //retorna uma string contendo a expressão.

            var expression = operation + "(";
            for(var i=0; i<size; i++){
                expression += "x" + i + "^" + exponents[i] + (i<size-1? " * " : "");
            }
            return expression + ")";
        },

        getSize : function(){
            return size;
        },

        getOp : function(){
            return operation;
        },

        setOp : function(op){
            operation = op;
        },

        shiftOp : function (){
            
            //faz um shift no operador, útil para a busca local.
            operation = OP.nextN(operation, 1);
        },

        evaluate : function(DataPoint){

            //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

            var value = 1.0;

            for(var i=0; i<DataPoint.x.length; i++){
                value *= Math.pow(DataPoint.x[i], exponents[i]);
            }

            return OP.solve(operation, value);
        },

        getExp : function(index){
            //out of range
            if (index>=size)
                return 0;
            return exponents[index];
        },

        setExp : function(index, value){
            //out of range
            if (index>=size){
                return 0;
            }
            exponents[index] = value;
        },

        increaseExp : function (index, value){

            //out of range
            if (index>=size)
                return 0;
            exponents[index] += value;
        }
    };
};

var Expression = function(expressionSize, numberOfVariables){

    //expressão completa, composta por "size" expressões pequenas

    //construtor:

    //membros privados
    var size = expressionSize;
    var coefficients = [ ];
    var equation = [ ];
    
    //esses membros são de interesse externo
    var mse = Math.exp(300);
    var expressionValue = 0.0;

    for (var i=0; i<size; i++){
        equation.push(new MiniExpression(numberOfVariables));

        //inicializa os coeficientes com 1.0, para não ter influencia
        coefficients.push(1.0);
    }

    var adjustCoefficients = function(inputPoints, numIterations, learningRate, threshold){

        //ajusta os parâmetros.

                //"zera" os coeficientes
        for(var i=0; i<coefficients.length; i++){
            coefficients[i]=1;
        }

        for(var i=0; i<numIterations; i++){

            for(var j=0; j<size; j++){
                var result = 0.0;

                for(var k=0; k<inputPoints.length; k++){
                    aux = equation[j].evaluate(inputPoints[k]);
                    result += (aux*coefficients[j] - inputPoints[k].y)*aux;
                }
                //não sei se deveria tirar a média
                result *= 2/inputPoints.length;

                coefficients[j] -= learningRate*result;

                //caso o coeficiente cresça tanto que vire NaN ou infinito
                if (isNaN(coefficients[j]) || !isFinite(coefficients[j]))
                    coefficients[j] = 1;
                if (coefficients[j] <= threshold)
                    return;
            }
        }
    };

    var calculateMse = function(inputPoints){

        //calcula o mse.
        mse = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<size; j++){
                aux+= coefficients[j]*equation[j].evaluate(inputPoints[i]);
            }
            mse += Math.pow(inputPoints[i].y - aux, 2);
        }
        mse = Math.sqrt(mse/inputPoints.length);

        if (!isFinite(mse) || isNaN(mse))
            mse = Math.exp(300);
    };

    return{
        getExpression_d : function(){

            //retorna uma string da expressão

            var expression = "";
            for(var i=0; i<size; i++){
                expression += coefficients[i].toFixed(2) + "*" + equation[i].getMiniExpression_d() + (i<size-1? "+" : "");
            }

            return expression;
        },

        getMse : function(){
            return mse;
        },

        evaluate : function(inputPoints){

            //para avaliar é preciso ajustar os coeficientes e calcular o novo mse.

            adjustCoefficients(inputPoints, 1000, 0.001, 0.05);
            calculateMse(inputPoints);

            return mse;
        },

        localSearch : function(inputPoints, numberOfOperators){

            //local search nos operadores:
            //faz um shift entre os operadores (8 operadores no total)

            //percorre todas as mini expressões
            for (var i=0; i<size; i++){

                var previousMse = mse; //valor anterior
                var bestOp = equation[i].getOp(); //operador
                var bestExp; //expoente

                //é só uma operação por miniexpressão, mas a pesquisa deve
                //abrangir todos os operadores possíveis
                for(var j=0; j<numberOfOperators; j++){
                    //percorre cada um dos operadores buscando um novo melhor
                    equation[i].shiftOp();
                    this.evaluate(inputPoints);

                    if (mse < previousMse){
                        bestOp = equation[i].getOp();
                        previousMse = mse;
                    }
                }
                
                //atualiza o mse do local search para efetuar nos expoentes
                equation[i].setOp(bestOp);
                this.evaluate(inputPoints);
                previousMse = mse;

                //local search entre os exp (são vários exp por cada mini
                //expressão:
                for (var j=0; j<equation[0].getSize(); j++){

                    bestExp = equation[i].getExp(j);

                    //aumenta 1 no original e calcula
                    equation[i].increaseExp(j, 1);
                    this.evaluate(inputPoints);
                    if (mse < previousMse){
                        bestExp = equation[i].getExp(j);
                        previousMse = mse;
                    }

                    //diminui 1 no original e calcula
                    equation[i].increaseExp(j, -2);
                    this.evaluate(inputPoints);
                    if (mse < previousMse){
                        bestExp = equation[i].getExp(j);
                        previousMse = mse;
                    }

                    equation[i].setExp(j, bestExp);
                    this.evaluate(inputPoints);
                }
            }
        }
    };
};

var Population = function(populationSize, expressionSize, numberOfVariables){

    //"gerenciadora" da população

    var subjects = [ ];
    var size = populationSize;

    for(var i=0; i<size; i++){
        subjects.push(new Expression(expressionSize, numberOfVariables));
        if (i==(size/2)) expressionSize++;
    }

    //aqui chama o ajuste de coeficientes e calculo do mse
    for(var i=0; i<size; i++){
        subjects[i].evaluate(inputPoints);
    }

    var theBest = subjects[0];

    var findBestExpression = function(){
        //pega a melhor expressão da pop (a com o menor mse)
        
        for(var i=0; i<size; i++){
            if(subjects[i].getMse() <= theBest.getMse())
                theBest = subjects[i];
        }
    };

    return {

        getBestExpression_d : function(){
            findBestExpression();
            return theBest.getExpression_d();
        },

        getBestExpressionMse_d : function(){
            return theBest.getMse();
        },

        evaluate : function(){
            
            //chama os métodos de todos os individuos

            for(var i=0; i<size; i++){
                subjects[i].evaluate(inputPoints);
            }
        },

        localSearch : function(inputPoints, numberOfOperators){
            for(var i=0; i<size; i++){
                subjects[i].localSearch(inputPoints, numberOfOperators);
                subjects[i].evaluate(inputPoints);
            }
        },

        localSearchBestExpression : function(inputPoints, numberOfOperators){

            //executa o local search, mas só no melhor indivíduo, e não
            //na pop inteira.
            findBestExpression();
            theBest.localSearch(inputPoints, numberOfOperators);
            //theBest.evaluate(inputPoints); acho que isso está redundante!!!
        }
    };
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