//main.js


//aqui todas as implementações específicas à página são feitas, para separar
//a biblioteca desenvolvida com as funções de interesse específico.


function changeIcon(element, language){

    //função para trocar o ícone em collapses

    let down = "glyphicon glyphicon-triangle-bottom";
    let up = "glyphicon glyphicon-triangle-top";

    if (document.getElementById(element).className==down)
        document.getElementById(element).className=up;
    else
        document.getElementById(element).className=down;
}

function get_example(element, language, type){
    document.getElementById(element).value = localStorage.getItem("chosen-example");

    user_upload(element, language, type);
}

function user_upload(element, language, type){
    //função para tratar o upload de dados e exibir erros para entradas 
    //incoerentes passadas pelo usuário

    try{
        if (type == 'csv')
            csv_upload(element);
        else if (type=='manual')
            manual_upload(element);
        
        document.getElementById("notification").innerHTML= "<div class='alert alert-success'>" + (language=='pt' ? "<strong>Sucesso!</strong> Os dados foram carregados.</div>" :"<strong>Success!</strong> Data loaded.</div>");
    }
    catch(err){
        if (err == "undefined csv")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt' ? "<strong>Atenção!</strong> O site só aceita arquivos de extensão .csv, e o algoritmo precisa de pelo menos uma linha de entrada para funcionar.</p></div>" : "<strong>Warning!</strong> The site only accepts .csv files, and the algorithm needs at least one input line to work.</p></div>");
        else if (err == "corrupted lines")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> Nem todas as suas linhas de entrada contém a mesma quantidade de números!</p></div>" : "<strong>Warning!</strong> Not all of your input lines contains the same amount of numbers!</p></div>");
        else if (err == "no data")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> O algoritmo precisa de pelo menos uma linha de entrada para funcionar.</p></div>" : "<strong>Warning!</strong> The algorithm needs at least one input line to work.</p></div>");
        else if (err == "only 1 value")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> cada linha precisa de pelo menos 2 valores!</p></div>" : "<strong>Warning!</strong> Each line needs at least 2 values!</p></div>");
        else{
            document.getElementById("notification").innerHTML= language=='pt' ? "<strong>Erro desconhecido! Favor reportar isso na página de feedback.</strong>" : "<strong>Unknown error! Please report this at the feedback page.</strong>";
        }
    }
}


//--MÉTODOS PRINCIPAIS----------------------------------------------------------//
var expression = undefined; //guarda o retorno do método de regressão simbólica utilizado

function run_regression(algorithm, language){
    if (inputPoints[0]===undefined){
        document.getElementById("sr-notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt' ? "<strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>" : "<strong>Attention!</strong> No data found!</p></div>");
        return;
    }
    else{
        document.getElementById("sr-notification").innerHTML="";
    }

    document.getElementById("results").style.display = "inline";

    expression = undefined; //guardar a melhor expressão
    let startTime = performance.now(); //medir o tempo de execução

    if (algorithm==="ITLS")
        expression = new IT_LS(150, 1, 3, 50);
    else if (algorithm==="ITES")
        expression = new IT_ES(150, 1, 3, 45, 50);
    else if (algorithm==="SymTree")
        expression = new SymTree(5, 0.05, 0, 0);
    else
        console.error("método inválido");

    let elapsedTime = performance.now() - startTime;

    expression.simplify(0.05);
    let expressionString = expression.printMe();

    for(let i=0; i<labels.length; i++){
        expressionString = expressionString.split("x"+i).join(labels[i]);
    }
    if (language=='pt'){
        document.getElementById("sr-result").innerHTML="<p><pre><p>Algoritmo: "+algorithm+"</p><p>Expressão: "+ expressionString+ "</p><p>Score: "+expression.score+"</p><p>Tempo (em ms): "+elapsedTime+"</p></pre></p>";
    }
    else {
        document.getElementById("sr-result").innerHTML="<p><pre><p>Algorithm: "+algorithm+"</p><p>Expression: "+ expressionString+ "</p><p>Score: "+expression.score+"</p><p>Time (in ms): "+elapsedTime+"</p></pre></p>";
    }
    
    let checkboxes = "<strong> T</strong>:<br><form>";
    for(let i=0; i<expression.terms.length; i++){
        checkboxes += "<input type='checkbox' id='check"+i+"' value='true'> <label for='check"+i+"'> "+expression.terms[i].printMe()+"</label><br>";
    }
    checkboxes += "</form>";

    let Xplot = "<strong> X</strong>:<br><form>";
    for (let i=0; i<inputPoints[0].x.length; i++){
        Xplot += "<input type='radio' name='variable' id='x"+i+"'> <label for='x"+i+"'> x" + i +"</label><br>";
    }
    Xplot += "</form>";

    document.getElementById("sr-graphics").innerHTML = checkboxes+Xplot;

    return expression;
}


function update_plot(){
    let choosenTerms = [ ];
    for (let i=0; i<expression.terms.length; i++)
        if (document.getElementById("check"+i).checked)
            choosenTerms.push(expression.terms[i].copy());

    if (choosenTerms.length==0)
        return;
        
    let plot = new LE(choosenTerms);

    let x = [ ];
    let y = [ ];

    for(let i=0; i<inputPoints.length; i++){
        x.push(plot.solve(inputPoints[i]));
        y.push(inputPoints[i].y);
    }

    let trace = {x, y, mode: 'markers'};
    Plotly.newPlot('func-ploter', [trace]);
}

function update_variable_plot(){
    let index = -1;

    for (let i=0; i<inputPoints[0].x.length; i++)
        if (document.getElementById("x"+i).checked==true){
            index = i;
            console.log(i);
            break;
        }

    if (index>=0){
        let choosenTerms = [ ];
        for (let i=0; i<expression.terms.length; i++)
            if (document.getElementById("check"+i).checked)
                choosenTerms.push(expression.terms[i].copy());
        
        if (choosenTerms.length==0)
            return;
            
        let plot = new LE(choosenTerms);

        let newPoints = [ ];
        let min = Infinity;
        let max = -Infinity;

        for (let i=0; i<inputPoints.length; i++){
            if (inputPoints[i].x[index]>max)
                max = inputPoints[i].x[index];
            if (inputPoints[i].x[index]<min)
                min = inputPoints[i].x[index];    
        }
        let h = (max-min)*0.02;

        let x = [ ];
        let y = [ ];

        for (let i=0; i<50; i++){ //50 valores
            let aux = [ ];
            for (let j=0; j<inputPoints[0].x.length; j++){
                if (j!=index)
                    aux.push(1);
                else
                    aux.push(min + h*i);
            }
            console.log(aux);
            x.push(min + h*i);
            y.push(plot.solve(new DataPoint(aux, 1)));
        }
        let trace = {x, y, mode: 'markers'};

        Plotly.newPlot('func-ploter', [trace]);
    }
}