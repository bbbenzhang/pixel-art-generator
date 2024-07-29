const input = document.getElementById('image');
const preview = document.getElementById('preview');
const dimensions = document.getElementById('dimensions')

const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');

const generateButton = document.getElementById('generate');

const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

const result = document.getElementById('resultCanvas');
const resultCtx = result.getContext('2d');

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
                dimensions.style.display = "contents";
                result.style.display = "none";
            }
        };
        reader.readAsDataURL(file);
    }
    else {
        preview.innerHTML = '';
        dimensions.style.display = "none";
        result.style.display = "none";
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
                
                temp.data[0] = Math.floor(avg[0] / (widthStep * heightStep));
                temp.data[1] = Math.floor(avg[1] / (widthStep * heightStep));
                temp.data[2] = Math.floor(avg[2] / (widthStep * heightStep));
                temp.data[3] = Math.floor(avg[3] / (widthStep * heightStep));

                resultCtx.putImageData(temp, i, j);
            }
        }

        result.style.display = "block";
    }
})




