import { vertexShaderSourceCode } from './shaderSourceFile.js';
import { fragmentShaderSourceCode } from './shaderSourceFile.js';

function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box'); //find error box
    const errorSpan = document.createElement('p');    //create span (paragraph element) to store error tex
    errorSpan.innerText = errorText; //add error text
    errorBoxDiv.appendChild(errorSpan); //add error text to the box
    console.error(errorText); //console.log(errorText) for redundant error message
}
showError("I forgot how to change the colors :(")
function mainFunction() {
    const canvas = document.getElementById("IDcanvas");
    if (!canvas) {
        showError("Can't find canvas reference");
        return;
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        showError("Can't find webgl2 support");
        return;
    }

    const vertexData = [
        -0.1, -0.8, //v1
        -0.8, -0.2, //v2
        -0.5, 0.6,  //v3
        0.3, 0.8,  //v4
        0.8, 0.6,  //v5
        0.8, -0.6  //v6
        -0.1, -0.8, //v1
    ]

    const colorData = [
       0.1, 0.3, 0.8,
       0.1, 0.3, 0.8,
       0.1, 0.3, 0.8,
       0.1, 0.3, 0.8,
       0.1, 0.3, 0.8,
       0.1, 0.3, 0.8
    ]

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError('Compile vertex error: ' + errorMessage);
        return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        showError('Compile vertex error: ' + errorMessage);
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(program);
    showError(`Failed to link GPU program: ${errorMessage}`);
        return;
    }

    const positionLocation = gl.getAttribLocation(program, `position`);
    if (positionLocation < 0) {
        showError(`Failed to get attribute location for position`);
        return;
    }
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(program, `color`);
    if (colorLocation < 0) {
        showError(`Failed to get attribute location for color`);
        return;
    }
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const uniformLocations = {
       uTranslateMatrix: gl.getUniformLocation(program, `u_TranslateMatrix`),
    };
    
    if (uniformLocations.uTranslateMatrix == null) {
        showError(`Failed to get uniform location for u_TranslateMatrix`);
        return;
    }

    const IdMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    var theta = 0;

    function rotateZ(matrix, theta){
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const result = matrix.slice();
        result[0] = cosTheta * matrix[0] - sinTheta * matrix[1];
        result[1] = sinTheta * matrix[0] + cosTheta * matrix[1];
        result[4] = cosTheta * matrix[4] - sinTheta * matrix[5];
        result[5] = sinTheta * matrix[4] + cosTheta * matrix[5];
        return result;
    }

    function animate() {
        requestAnimationFrame(animate);
        theta = theta + Math.PI / 500;
        const translatedMatrix = rotateZ(IdMatrix, theta);
        gl.uniformMatrix4fv(uniformLocations.uTranslateMatrix, false, translatedMatrix);
        gl.clearColor(0.5, 0.3, 0.3, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, 6);
        gl.drawArrays(gl.LINE_LOOP, 0, 6);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);
    }
    animate();

}

try {
    mainFunction();
} catch (error) {
    showError('failed to run mainFunction() JS exception' + error);
}