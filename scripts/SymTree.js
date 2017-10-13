//SymTree.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.


// CLASSES DA ÁRVORE--------------------------------------------------------- //
var Term = function(exponents, operation){

    var exp = exponents;
    var op = operation;

    return {
        getTerm_d : function(){
            
            //retorna uma string contendo a expressão.

            var term = op + "(";
            for(var i=0; i<exponents.length; i++){
                term += "x" + i + "^" + exp[i] + (i<exponents.length-1? " * " : "");
            }
            return term + ")";
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

            for(var i=0; i<exponents.length; i++){
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

var LinearExpression = function(termsToUse, toExpand = [ ]){

    //construtor cria uma cópia de todos os termos passados.

    //variaveis privadas
    var coefficients = [ ];
    var terms = termsToUse.concat(toExpand);
    var score = 0.0;

    //métodos internos
    var adjustCoefficients = function(inputPoints, numIterations, learningRate){
        
        //ajusta os parâmetros.

        for(var i=0; i<numIterations; i++){

            for(var j=0; j<terms.length; j++){
                var result = 0.0;
        
                coefficients[j]=1;

                for(var k=0; k<inputPoints.length; k++){
                    aux = terms[j].evaluate(inputPoints[k]);

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

            for(var j=0; j<terms.length; j++){
                aux+= coefficients[j]*terms[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }
        mae = mae/inputPoints.length;

        if (!isFinite(mae) || isNaN(mae))
            mae = Math.exp(300);

        score = 1/ (1+ mae);
        console.log(score);
    };

    //criando todas as cópias
    for (var i=0; i<terms.length; i++){
        coefficients.push(1.0);
    }

    //ajuste inicial (executado no construtor)
    adjustCoefficients(inputPoints,  500, 0.25);
    calculateMAE(inputPoints);

    return {
        getLinearExpression_d : function(){
            
            //retorna uma string da expressão

            var linearExpression = "";
            for(var i=0; i<terms.length; i++)
                linearExpression += coefficients[i].toFixed(2) + "*" + terms[i].getTerm_d() + (i<terms.length-1? "+" : "");

            return linearExpression;
        },

        evaluateScore : function(inputPoints){
            adjustCoefficients(inputPoints,  500, 0.25);
            calculateMAE(inputPoints);

            return score;
        },

        simplify : function(threshold){
            
            //percorre uma expressão removendo todo termo de coeficiente menor
            //que o valor de threshold
        
            var i = -1;
        
            while (++i < coefficients.length){
                if (Math.abs(coefficients[i]) <= threshold){
                    coefficients.splice(i, 1);
                    terms.splice(i--, 1);
                }
            }
            this.evaluateScore(inputPoints);
        },

        expand : function(threshold, minI, minT){

        },

        getScore : function(){
            return score;
        },

        getCoefficients : function(){
            return coefficients;
        },

        getTerms : function(){
            return terms;
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

function vectorSum(vector1, vector2){

    var aux = [ ];

    for(var i=0; i<vector1.length; i++){
        aux.push(vector1[i]+vector2[i]);
        console.log(i);
    }
    return aux;
}

function vectorSub(vector1, vector2){
    
        var aux = [ ];
    
        for(var i=0; i<vector1.length; i++){
            aux.push(vector1[i]-vector2[i]);
            console.log(i);
        }
        return aux;
    }

function interaction(leaf){

    var leafTerms = leaf.getTerms();
    var result = [ ];

    for (var i=0; i<leafTerms.length; i++){

        for (var j=i; j<leafTerms.length; j++){
            result.push(new Term(vectorSum(leafTerms[i].getExp(), leafTerms[j].getExp()), leafTerms[0].getOp()) );
        }
    }
    return result;
}

function inverse(leaf){

    var leafTerms = leaf.getTerms();
    var result = [ ];

    for (var i=0; i<leafTerms.length; i++){

        for (var j=i; j<leafTerms.length; j++){
            result.push(new Term(vectorSub(leafTerms[i].getExp(), leafTerms[j].getExp()), leafTerms[0].getOp()) );
        }
    }
    return result;
}

function transformation(leaf){

}

function greedySearch(leaf, terms){

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
            nodes.push( leaves[i].expand(false, false) ); //nodes U expand
        }
        
        //leaves <- nodes
        leaves = leaves.concat(nodes);

        console.log(root.getLinearExpression_d());
        root.simplify(2);
        console.log(root.getLinearExpression_d());
        interaction(root);
        //só para evitar laços infinitos durante o desenvolvimento
        break;
    }
}