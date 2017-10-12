//SymTree.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.


// CLASSES DA ÁRVORE--------------------------------------------------------- //
var Term = function(exponents, operation){

    var variables = exponents.length;
    var exp = exponents;
    var op = operation;

    return {
        getTerm_d : function(){
            
            //retorna uma string contendo a expressão.

            var term = op + "(";
            for(var i=0; i<variables; i++){
                term += "x" + i + "^" + exp[i] + (i<variables-1? " * " : "");
            }
            return term + ")";
        },

        getVariables : function(){
            return variables;
        },

        getExp : function(){
            return exp;
        },

        getOp : function(){
            return op;
        },

        evaluate : function(DataPoint){

            //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

            var value = 1.0;

            for(var i=0; i<DataPoint.x.length; i++){
                value *= Math.pow(DataPoint.x[i], exp[i]);
            }

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
                    alert("PROBLEMA EM EVALUATETERM");
            }
        }
    }
}

var LinearExpression = function(terms, toExpand = [ ]){

    //construtor cria uma cópia de todos os termos passados.

    //variaveis privadas
    var coefficients = [ ];
    var myTerms = terms.concat(toExpand);
    var size = myTerms.length;
    var score = 0.0;

    //criando todas as cópias
    for (var i=0; i<myTerms.length; i++){
        coefficients.push(1.0);
    }

    var adjustCoefficients = function(inputPoints, numIterations, learningRate){
        
        //ajusta os parâmetros.

        for(var i=0; i<numIterations; i++){

            for(var j=0; j<size; j++){
                var result = 0.0;
        
                coefficients[j]=1;

                for(var k=0; k<inputPoints.length; k++){
                    aux = myTerms[j].evaluate(inputPoints[k]);

                    result += (aux*coefficients[j] - inputPoints[k].y)*aux;
                }

                result *= 2/inputPoints.length;

                coefficients[j] -= learningRate*result;

                //caso o coeficiente cresça tanto que vire NaN ou infinito
                if (isNaN(coefficients[j]) || !isFinite(coefficients[j]))
                    coefficients[j] = 1;
            }
        }
    };

    var calculateMAE = function(inputPoints){
        
        //calcula o mse.
        var mae = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<size; j++){
                aux+= coefficients[j]*myTerms[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }
        mae = mae/inputPoints.length;

        if (!isFinite(mae) || isNaN(mae))
            mae = Math.exp(300);

        score = 1/ (1+ mae);
    };

    return {
        getCoefficient : function(index){
            if (index > size -1){
                alert ("TENTANDO ACESSAR COEFICIENTE FORA DO ARRAY");
                return -1;
            }
            return coefficients[index];
        },

        popTerm : function(index){
            if (index > size -1){
                alert ("TENTANDO ACESSAR COEFICIENTE FORA DO ARRAY");
                return -1;
            }
            myTerms.splice(index, 1);
            coefficients.splice(index, 1);
        },

        pushTerm : function(term){
            myTerms.push(term);
            coefficients.push(1);
        },

        getLinearExpression_d : function(){
            
            //retorna uma string da expressão

            var linearExpression = "";
            for(var i=0; i<size; i++)
                linearExpression += coefficients[i].toFixed(2) + "*" + myTerms[i].getTerm_d() + (i<size-1? "+" : "");

            return linearExpression;
        },

        evaluateScore :  function(inputPoints){
            adjustCoefficients(inputPoints,  500, 0.25);
            calculateMAE(inputPoints);

            return score;
        }
    }
}


// MÉTODOS AUXILIARES-------------------------------------------------------- //
function rootTerms(){
    //cria um grupinho que serve pra inicializar o root
    var terms = [ ];

    for(var i=0; i<inputPoints[0].x.length; i++){
        let aux = [ ];
        for (var j=0; j<inputPoints[0].x.length; j++)
            aux.push(i==j? 1 : 0);
        terms.push(new Term(aux, "id"));
    }
    return terms;
}

function expand(leaf, threshold, minI, minT){

}

function interaction(leaf){

}

function inverse(leaf){

}

function transformation(leaf){

}

function greedySearch(leaf, terms){

}

function simplify(leaf, threshold){

    //percorre uma expressão removendo todo termo de coeficiente menor
    //que o valor de threshold

    for (var i=0; i<leaf.length; i++){
        if (leaf[i].getCoefficient[i] < threshold){
            leaf.popTerm(i);
        }
    }
}


// MAIN---------------------------------------------------------------------- //
function run_SymTree(){

    //laço principal da SymTree

    //root <- LinearExpression(x);
    var root = new LinearExpression(rootTerms());

    //leaves <- root
    var leaves = [root];

    //while criteria not met
    while (true){
        var nodes = [ ];

        //for leaf in leaves
        for (var i=0; i<leaves.length; i++){
            nodes.push( expand(leaves[i]) ); //nodes U expand
        }
        
        //leaves <- nodes
        leaves = leaves.concat(nodes);
        
        //só para evitar laços infinitos durante o desenvolvimento
        break;
    }

    console.log(root.getLinearExpression_d());
}