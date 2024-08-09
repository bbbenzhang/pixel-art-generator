const input = document.getElementById('image');
const preview = document.getElementById('preview'); // displaying the preview
const dimensions = document.getElementById('dimensions')

const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');

const generateButton = document.getElementById('generate');

const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d'); // keep the full image data on this invisible canvas

const result = document.getElementById('resultCanvas');
const resultCtx = result.getContext('2d');

const download = document.getElementById("download");
const link = document.getElementById('link');

const resultContainer = document.getElementById('rightContainer')

const monochrome = document.getElementById('monochrome');
const palette = document.getElementById('palette');
const newColor = document.getElementById('new-color');
const colors = document.getElementById('colors');
const colorsContainer = document.getElementById('colors-container');
const customColors = []
const importPalette = document.getElementById('import');
const paletteCanvas = document.getElementById('paletteCanvas');
const paletteCtx = paletteCanvas.getContext('2d'); // read the colors off the imported palette using this canvas
const clear = document.getElementById('clear');

const MAX_WIDTH = 900;
const MAX_HEIGHT = 600;

input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = document.createElement('img');
            image.src = e.target.result;

            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);

                const ratio = Math.max(image.width / MAX_WIDTH, image.height / MAX_HEIGHT);
                if (ratio > 1) {
                    image.width /= ratio;
                    image.height /= ratio;
                }
                preview.innerHTML = '';
                preview.appendChild(image);
                dimensions.style.display = "flex";
                resultContainer.style.display = "none";
                if (palette.checked) colorsContainer.style.display = 'flex';
            }
        };
        reader.readAsDataURL(file);
    }
    else {
        preview.innerHTML = '';
        dimensions.style.display = "none";
        resultContainer.style.display = "none";
        colorsContainer.style.display = 'none';
    }
});

widthInput.addEventListener('input', () => {
    const width = parseInt(widthInput.value);
    if (width > 100) widthInput.value = "100";
    if (width < 0 || width === NaN) widthInput.value = "1";
});

widthInput.addEventListener('change', () => {
    if (!widthInput.value) {
        widthInput.value = "1";
        return;
    }
});

heightInput.addEventListener('input', () => {
    const height = parseInt(heightInput.value);
    if (height > 100) heightInput.value = "100";
    else if (height < 0 || height === NaN) heightInput.value = "1";
});

heightInput.addEventListener('change', () => {
    if (!heightInput.value) {
        heightInput.value = "1";
        return;
    }
});

generateButton.addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
        const data = imageData.data;
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const widthStep = Math.floor(canvas.width/width);
        const heightStep = Math.floor(canvas.height/height);
        const temp = resultCtx.createImageData(1, 1);
        const avg = [0, 0, 0, 0]

        result.width = width;
        result.height = height;

        for (let i = 0; i < width; i++) {

            for (let j = 0; j < height; j++) {

                avg[0] = avg[1] = avg[2] = avg[3] = 0
                
                for (let x = i * widthStep; x < (i + 1)*widthStep; x++) {

                    for (let y = j * heightStep; y < (j + 1)*heightStep; y++) {

                        //convert x-y to the one dimensional array coordinate

                        index = x * 4 + y * 4 * canvas.width;
                        avg[0] += data[index];
                        avg[1] += data[index + 1];
                        avg[2] += data[index + 2];
                        avg[3] += data[index + 3];
                    }

                }

                avg[0] = Math.floor(avg[0] / (widthStep * heightStep));
                avg[1] = Math.floor(avg[1] / (widthStep * heightStep));
                avg[2] = Math.floor(avg[2] / (widthStep * heightStep));
                avg[3] = Math.floor(avg[3] / (widthStep * heightStep));
                
                if (monochrome.checked) {
                    const result = Math.min(Math.pow((Math.pow(avg[0]/255.0,2.2)*0.2126+Math.pow(avg[1]/255.0,2.2)*0.7152+Math.pow(avg[2]/255.0,2.2)*0.0722),0.454545)*255);
                    temp.data[0] = temp.data[1] = temp.data[2] = result;
                    temp.data[3] = 255; //avg[3];
                }
                else if (palette.checked && customColors.length > 0) {
                    let closestColor = customColors[0];
                    let closestDistance = distance(closestColor, avg);
                    let cur = 0;
                    for (let i = 1; i < customColors.length; i++) {
                        cur = distance(customColors[i], avg);
                        if (cur < closestDistance) {
                            closestDistance = cur;
                            closestColor = customColors[i];
                        }
                    }
                    temp.data[0] = closestColor[0];
                    temp.data[1] = closestColor[1];
                    temp.data[2] = closestColor[2];
                    temp.data[3] = avg[3];
                }
                else {
                    temp.data[0] = avg[0];
                    temp.data[1] = avg[1];
                    temp.data[2] = avg[2];
                    temp.data[3] = avg[3];
                }

                resultCtx.putImageData(temp, i, j);
            }
        }

        resultContainer.style.display = "flex";
    }
})

download.addEventListener('click', () => {
    link.download = 'pixel_art.png';
    link.href = result.toDataURL();
    link.click();
});

monochrome.addEventListener('input', () => {
    if (monochrome.checked) {
        palette.checked = false;
        colorsContainer.style.display = 'none';
    }
});

palette.addEventListener('input', () => {
    if (palette.checked) {
        monochrome.checked = false;
        colorsContainer.style.display = 'flex';
    }
    else colorsContainer.style.display = 'none';
})

newColor.addEventListener('change', () => {
    const color = [Number(`0x${newColor.value.slice(1, 3)}`), Number(`0x${newColor.value.slice(3, 5)}`), Number(`0x${newColor.value.slice(5, 7)}`)];
    
    if (!customColors.find((value) => {
        return value[0] === color[0] && value[1] === color[1] && value[2] === color[2];
    })) {
        customColors.push(color);
        colors.appendChild(createColor(newColor.value, color));
    }
    
});

importPalette.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = document.createElement('img');
            image.src = e.target.result;

            image.onload = () => {
                if (image.width * image.height >= 256) {
                    alert("Palette too large!");
                    importPalette.value = "";
                }
                else {
                    paletteCanvas.width = image.width;
                    paletteCanvas.height = image.height;
                    paletteCtx.drawImage(image, 0, 0);

                    const paletteData = paletteCtx.getImageData(0, 0, paletteCanvas.width, paletteCanvas.height);
                    if (paletteData) {
                        const data = paletteData.data;
                        for (let i = 0; i < data.length; i += 4) {
                            if (!customColors.find((value) => {
                                return value[0] === data[i] && value[1] === data[i + 1] && value[2] === data[i + 2];
                            })) {
                                customColors.push([data[i], data[i + 1], data[i + 2]]);
                                colors.appendChild(createColor(`rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`, [data[i], data[i + 1], data[i + 2]]));
                            }
                        }
                    }
                }            
            }
        };
        reader.readAsDataURL(file);
    }
});

clear.addEventListener('click', () => {
    customColors.splice(0, customColors.length);
    colors.innerHTML = '';
});

function createColor(hex, rgb) {
    const color = document.createElement('div');
    color.classList.add('color');

    const colorChip = document.createElement('div');
    colorChip.classList.add('box');
    colorChip.style.backgroundColor = hex;
    color.appendChild(colorChip);

    const colorText = document.createElement('p');
    colorText.innerHTML = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    color.appendChild(colorText);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.innerHTML = "&#10006;";
    color.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        const index = customColors.findIndex((value) => {
            return value[0] === rgb[0] && value[0] === rgb[0] && value[0] === rgb[0];
        })
        customColors.splice(index, 1);
        color.remove();
    })

    return color;
}

function distance (one, two) {
    return Math.sqrt(Math.pow(one[0] - two[0], 2) + Math.pow(one[1] - two[1], 2) + Math.pow(one[2] - two[2], 2));
}