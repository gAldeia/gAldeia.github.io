//Generator.js


function set_example(element){
    console.log(element);
    
    var table = element.innerHTML;

    let start = table.indexOf("<tbody>"); 
    let end = table.indexOf("<\/tbody>");

    table = table.slice(start +7, end);

    table = table.replace(/<tr>|<\/tr>|<th>|<td>|\t/g,"");
    table = table.replace(/<\/th>|<\/td>/g, " ");
 
    localStorage.setItem("chosen-example", table);
}

function noise(value){
    //adiciona um erro nas medidas, de acordo com a porcentagem definida.

    let percentError = 0.01;
    value *=percentError;
    
    return Math.random()>0.5? value : -1*value;
}

function generateLines(language){
    let userExp = document.getElementById("expressionInput").value;
    
    if (userExp.length==0){
        document.getElementById("expressionOutput").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt' ? "<strong>Atenção!</strong> Você não digitou uma expressão.</p></div>" : "<strong>Attention!</strong> You have not entered an expression.</p></div>");
        return;
    }
    if (userExp.indexOf("x0")==-1){
        document.getElementById("expressionOutput").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt' ? "<strong>Atenção!</strong> As variáveis não começam com o 'x0'.</p></div>" : "<strong>Attention!</strong> The variables doesn't start with 'x0'");
        return;
	}

    let mat = createMatrix(document.getElementById("expressionInput").value, document.getElementById("range").value, document.getElementById("noise").checked, document.getElementById("positiveOnly").checked);

    document.getElementById("expressionOutput").innerHTML = createTable(mat, document.getElementById("expressionInput").value);
}

function createMatrix(expression, range, useNoise, strictlyPositive){
    let nOfVars = 0;

    for(let i=0; i<10; i++){
        if (expression.split("x"+i).length - 1)
            nOfVars++;
    }

    let x = [ ];
    for (i=0; i<range*nOfVars; i++) {
        x.push((strictlyPositive? 0 : -range*nOfVars/2) + i);
    }

    let matrix = [ ];
    for(let i=0; i<range; i++){
        let expressionAux = expression.slice(0);
        let line = [ ];
        for(let j=0; j<nOfVars; j++){
            let index = Math.floor(Math.random()*x.length);
            line.push(x[index]);
            x.splice(index, 1);
            expressionAux = expressionAux.split("x"+j).join(line[j]);
        }
        let result;

        try{
            result = eval(expressionAux);
        }
        catch(err){
            document.getElementById("expressionOutput").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> Alguma coisa está errada. Verifique se não esqueceu algum operador entre dois números e se funções matemáticas (seno, cosseno, raiz, etc) estão de acordo com a sintaxe da biblioteca Math do javascript (Math.sin(), Math.cos(), Math.sqrt()).</p></div>" : "<strong>Attention!</strong> Something is wrong. Make sure you have not forgotten an operator between two numbers, and if math functions (sine, cosine, root, etc.) are in accordance with the javascript library's Math syntax (Math.sin (), Math.cos (), Math.sqrt )). </p></div>");
            return [];
        }
        if (useNoise) result += noise(result);

        line.push(result.toFixed(2));
        matrix.push(line);
    }
    console.log(x.length);
    return matrix;
}

function createTable(matrix, tableName){

    let header = '<tbody><tr>';
    for(let i=0; i<matrix[0].length-1; i++)
        header+= '<th>' + ('x' + i) + '<\/th>';
    header += '<th>f(X)<\/th><tr>';

    let lines = '';
    for(let i=0; i<matrix.length; i++){
        lines += '<tr>';
        for(let j=0; j<matrix[i].length; j++)
            lines+='<td>' + matrix[i][j] + '<\/td>';
        lines +='<\/tr>\n';
    }

    return '<\/tbody><table align="center" style="width:' + matrix[0].length*65 + 'px">'+header+lines+'<caption class="text-center">'+tableName+' <button onclick="set_example(this.parentElement.parentElement)"><span class="glyphicon glyphicon-share"><\/span><\/button><\/caption><\/table>';
}

(function(){
    tableHolder = document.getElementById("tableHolder");
    
    let expressions = ["x0*x0", "Math.sqrt(x0)", "Math.sin(x0)", "x0 + x1*x1", "x0*x1", "Math.cos(x0) + x1*x1"];
    let expressionsNames = ["f(x) = x<sup>2</sup>", "f(x) = &radic;x", "f(x) = sin(x)", "f(x0, x1) = x0 + x1<sup>2</sup>", "f(x0, x1) = x0&middot;x1", "f(x0, x1) = cos(x0) + x1<sup>2</sup>"];

    for(let i=0; i<expressions.length; i++){
        let mat = createMatrix(expressions[i], 20, false, (i==1 || i==5));
        tableHolder.innerHTML += '<div class="col-lg-4"><p>'+createTable(mat, expressionsNames[i])+'</p></div>';
    }
})();