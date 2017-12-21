//SymbolicRegressionTest.js


function run_regression_d(algorithm){ //versão para avaliar desempenho
    if (inputPoints[0]===undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

    document.getElementById("results").innerHTML="<p>Algoritmo: <strong>"+ algorithm + "</strong></p>";

    let resultTable = '<p><table align="center" style="width:100%"><tr><th># Execução</th><th>Equação</th><th>Score</th><th>Tempo (ms)</th></tr>'

    let numTests = 30;
    
    let sumScore = 0;
    let sumTime = 0;

    let scores = [ ];
    let times = [ ];

    //calcula e descarta a primeira, pois o tempo é muito diferente do restante. talvez na primeira vez tenha um processamento mais pesado.
    let expression = undefined; //guardar a melhor expressão
    if (algorithm==="ITLS")
        expression = new IT_LS(150, 1, 3, 50);
    else if (algorithm==="ITES")
        expression = new IT_ES(150, 1, 3, 45, 50);
    else if (algorithm==="SymTree")
        expression = new SymTree(5, 0.05, 0, 0);
    else
        console.error("método inválido");

    for(let i=0; i<numTests; i++){

        let expression = undefined; //guardar a melhor expressão
        let startTime = performance.now(); //medir o tempo de execução

        if (algorithm==="ITLS")
            expression = new IT_LS(150, 1, 3, 50);
        else if (algorithm==="ITES")
            expression = new IT_ES(150, 1, 3, 45, 50);
        else if (algorithm==="SymTree")
            expression = new SymTree(5, 0.05, 0, 0);
        else
            console.error("método inválido");

        scores.push(expression.score);
        times.push(performance.now() - startTime);
        
        sumScore += scores[i];
        sumTime += times[i];

        expression.simplify(0.05);

        resultTable +='<tr><td>'+i+'</td><td>'+expression.printMe()+'</td><td>'+scores[i]+'</td><td>'+times[i]+'</td></tr>';
    }

    sumScore/=numTests;
    sumTime/=numTests;

    let varScore = 0;
    let varTime = 0;
    for(let i=0; i<numTests; i++){
        varScore += Math.pow(scores[i] - sumScore, 2);
        varTime += Math.pow(times[i] - sumTime, 2);
    }

    varScore/=numTests;
    varTime/=numTests;
    
    resultTable += '<tr><td><strong>Média</strong></td><td>---</td><td><strong>'+sumScore+'</strong></td><td><strong>'+sumTime+'</strong></td></tr>';
    resultTable += '<tr><td><strong>Variância</strong></td><td>---</td><td><strong>'+varScore+'</strong></td><td><strong>'+varTime+'</strong></td></tr>';
    resultTable += '<tr><td><strong>Desvio padrão</strong><td>---</td></td><td><strong>'+Math.sqrt(varScore)+'</strong></td><td><strong>'+Math.sqrt(varTime)+'</strong></td></tr></table></p>';

    document.getElementById("results").innerHTML+= resultTable;

}