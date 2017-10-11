//SymTree.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.

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
                    alert("PROBLEMA EM EVALUATESIMPLEFUNCTION");
            }
        }
    }
}

var LinearExpression = function(terms, toExpand){

    //construtor cria uma cópia de todos os termos passados.

    //variaveis privadas
    var coefficients = [ ];
    var size = terms.length + (toExpand==undefined ? 0 : 1);
    var myTerms = [ ];

    //criando todas as cópias
    for (var i=0; i<terms.length; i++){
        myTerms.push(new Term(terms[i].getExp(), terms[i].getOp()) );
        coefficients.push(1.0);
    }
    //acrescenta o novo termo se for passado
    if (toExpand!=undefined){
        myTerms.push(new Term(toExpand.getExp(), toExpand.getOp()) );
        coefficients.push(1.0);
    }

    return {
        getLinearExpression_d : function(){
            
            //retorna uma string da expressão

            var linearExpression = "";
            for(var i=0; i<size; i++)
                linearExpression += coefficients[i].toFixed(2) + "*" + myTerms[i].getTerm_d() + (i<size-1? "+" : "");

            return linearExpression;
        }
    }
}

// -------------------------------------------------------------------------- //

function run_SymTree(){

    //cria um grupinho que serve pra inicializar o root
    var terms = [ ];
    var aux = [ ];

    for(var i=0; i<inputPoints[0].x.length; i++){
        aux = [ ];
        for (var j=0; j<inputPoints[0].x.length; j++)
            aux.push(i==j? 1 : 0);
        terms.push(new Term(aux, "id"));
    }


    var root = new LinearExpression(terms);
    
    console.log(root.getLinearExpression_d());

}