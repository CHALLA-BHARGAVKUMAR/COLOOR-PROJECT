//Global selections and variables
const colorDivs=document.querySelectorAll('.color');
const generateBtn=document.querySelector('.generate');
const sliders=document.querySelectorAll('input[type="range"]');
const currentHexes=document.querySelectorAll('.color h2');
const popUp=document.querySelector('.copy-container');
const adjustButton=document.querySelectorAll('.adjust');
const lockButton=document.querySelectorAll('.lock');
const closeAdjustments=document.querySelectorAll('.close-adjustment');
const sliderContainers=document.querySelectorAll('.sliders');
let initialColors;
//this is for localstorage
let savedPalletes=[];
//add our event listeners
generateBtn.addEventListener('click',randomColors)
sliders.forEach(slider=>{
    slider.addEventListener('input',hslControls);
})
colorDivs.forEach((slider,index)=>{
    slider.addEventListener('change',()=>{
        updateTextUI(index);
    });
});
currentHexes.forEach(hex=>{
    hex.addEventListener('click',()=>{
        copyToClipboard(hex);
    });
});

popUp.addEventListener('transitionend',()=>{
    const popupBox=popUp.children[0];
    popUp.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButton.forEach((button,index)=>{
    button.addEventListener('click',()=>{
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button,index)=>{
    button.addEventListener('click',()=>
    {closeAdjustmentPanel(index);
    });
});
lockButton.forEach((button,index)=>{
button.addEventListener('click',(e)=>{
    lockedBtn(e,index);
});
});


//FUNCTIONS 

//color generator
function generateHex(){
    // const letters="#0123456789ABCDEF";
    // let hash="#";
    // for(let i=0;i<6;i++){
    //     hash+=letters[Math.floor(Math.random()*16)];
    // }
    // return hash;
    const hexColor=chroma.random();
    return hexColor;
}

function randomColors(){
    //
      initialColors=[];
    colorDivs.forEach((div,index)=>{
        console.log(div);
        const hexText=div.children[0];
        console.log(hexText);
        const randomColor=generateHex();
        //add it to the array
        if(div.classList.contains('locked')){
            console.log('hello123');
            initialColors.push(hexText.innerText);
            return;
        }else{
            console.log('hello');
            initialColors.push(chroma(randomColor).hex());
        }
        
        

        //Add the color to the background
        div.style.backgroundColor=randomColor;
        hexText.innerText=randomColor;
        //check for contrast
        checkTextContrast(randomColor,hexText);
        //initial colorize sliders
        const color=chroma(randomColor);
        const sliders=div.querySelectorAll('.sliders input');
        const hue=sliders[0];
        const brightness=sliders[1];
        const saturation=sliders[2];

        colorizeSliders(color,hue,brightness,saturation);
    });

    //reset inputs
    resetInputs();
    //Check for button contrast
    adjustButton.forEach((button,index)=>{
        checkTextContrast(initialColors[index],button);
        checkTextContrast(initialColors[index],lockButton[index]);
        
    })

}
function checkTextContrast(color,text){
    const luminance=chroma(color).luminance();
    if(luminance>0.5){
        text.style.color='black';
    }
    else{
        text.style.color='white';
    }
}

function colorizeSliders(color,hue,brightness,saturation){
    //scale saturation
    const noSat=color.set('hsl.s',0);
    const fullSat=color.set('hsl.s',1);
    const scaleSat=chroma.scale([noSat,color,fullSat]);
    //scale brightness
    const midBright=color.set('hsl.l',0.5);
    const scaleBright=chroma.scale(['black',midBright,'white']);

    //update input colors
    saturation.style.backgroundImage=`linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage=`linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage=`linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}
function hslControls(e){
    const index=e.target.getAttribute('data-bright')||e.target.getAttribute('data-sat')||e.target.getAttribute('data-hue');
    
    let sliders=e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue=sliders[0];
    const brightness=sliders[1];
    const saturation=sliders[2];
    

    const bgColor=initialColors[index];
    
    let color=chroma(bgColor)
    .set('hsl.s',saturation.value)
    .set('hsl.l',brightness.value)
    .set('hsl.h',hue.value)

    colorDivs[index].style.backgroundColor=color;

    //colorize inputs/sliders
    colorizeSliders(color,hue,brightness,saturation);
}
function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color=chroma(activeDiv.style.backgroundColor);
    const textHex=activeDiv.querySelector('h2');
    const icons=activeDiv.querySelectorAll('.controls button');
    textHex.innerText=color.hex();

    //check contrast
    checkTextContrast(color,textHex);
    for(icon of icons){
        checkTextContrast(color,icon);
    }

}
function resetInputs(){
    const sliders=document.querySelectorAll('.sliders input');
    sliders.forEach(slider=>{
        if(slider.name==='hue'){
            const hueColor=initialColors[slider.getAttribute('data-hue')];
            const hueValue=chroma(hueColor).hsl()[0]
            slider.value=Math.floor(hueValue);

        }
        if(slider.name==='brightness'){
            const brightColor=initialColors[slider.getAttribute('data-bright')];
            const brightValue=chroma(brightColor).hsl()[2]
            slider.value=Math.floor(brightValue*100)/100;

        }
        if(slider.name==='saturation'){
            const satColor=initialColors[slider.getAttribute('data-sat')];
            const satValue=chroma(satColor).hsl()[1]
            slider.value=Math.floor(satValue);

        }
    });
}
function copyToClipboard(hex){
    const el=document.createElement('textarea')
    el.value=hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    //pop up animation
    const popupBox=popUp.children[0];
    popUp.classList.add('active');
    popupBox.classList.add('active');
}
function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}
function lockedBtn(e,index){
    const lockSVG=e.target.children[0];
    const activeBg=colorDivs[index];
    activeBg.classList.toggle('locked');
    if(lockSVG.classList.contains('fa-lock-open')){
        e.target.innerHTML='<i class="fas fa-lock"></i>';
    }
    else{
        e.target.innerHTML='<i class="fas fa-lock-open"></i>';
    }
}

//Implement save to palette and and LOCAL STORAGE STUFF
const saveBtn=document.querySelector('.save');
const submitSave=document.querySelector('.submit-save');
const closeSave=document.querySelector('.close-save');
const saveContainer=document.querySelector('.save-container');
const saveInput=document.querySelector('.save-container input');
const libraryContainer=document.querySelector('.library-container');
const libraryBtn=document.querySelector('.library');
const closeLibraryBtn=document.querySelector('.close-library');

//event listeners
saveBtn.addEventListener('click',openPalette);
closeSave.addEventListener('click',closePalette)
submitSave.addEventListener('click',savePalette)
libraryBtn.addEventListener('click',openLibrary);
closeLibraryBtn.addEventListener('click',closeLibrary);
function openPalette(e){
    const popup=saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}
function closePalette(e){
    const popup=saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.add('remove');
}
function savePalette(e){
    saveContainer.classList.remove('active');
    popUp.classList.remove('active');
    const name=saveInput.value;
    const colors=[];
    currentHexes.forEach(hex=>{
        colors.push(hex.innerText);
    });
    //generate object
    let paletteNr;
    const paletteObjects=JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr=paletteObjects.length;
    }
    else{
        paletteNr=savedPalletes.length;
    }
    const paletteObj={name,colors,nr:paletteNr};
    savedPalletes.push(paletteObj);
    //savetolLocalstorage
    savetoLocal(paletteObj);
    saveInput.value="";
    //generate the pallette for library
    const palette=document.createElement('div');
    palette.classList.add('custom-palette');
    const title=document.createElement('h4');
    title.innerText=paletteObj.name;
    const preview=document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor=>{
        const smallDiv=document.createElement('div');
        smallDiv.style.backgroundColor=smallColor;
        preview.appendChild(smallDiv);



    });
    const paletteBtn=document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText='select';

    //attach event to the btn
    paletteBtn.addEventListener('click',e=>{
    closeLibrary();
    const paletteIndex=e.target.classList[1];
    initialColors=[];

     savedPalletes[paletteIndex].colors.forEach((color,index)=>{
        initialColors.push(color);
        colorDivs[index].style.backgroundColor=color;
        const text=colorDivs[index].children[0];
        checkTextContrast(color,text);
        updateTextUI(index);
     });
     resetInputs();
    });
    //appent to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes')===null){
        localPalettes=[];
    }
    else{
        localPalettes=JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes',JSON.stringify(localPalettes));
}
function openLibrary(){
    const popup=libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}
function closeLibrary(){
    const popup=libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal(){
    if(localStorage.getItem('palettes')===null){
        localPalettes=[];
    }
    else{
        const paletteObjects=JSON.parse(localStorage.getItem('palettes'));
        //2
        savedPalletes=[...paletteObjects];
        paletteObjects.forEach(paletteObj=>{
            //generate the pallette for library
    const palette=document.createElement('div');
    palette.classList.add('custom-palette');
    const title=document.createElement('h4');
    title.innerText=paletteObj.name;
    const preview=document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor=>{
        const smallDiv=document.createElement('div');
        smallDiv.style.backgroundColor=smallColor;
        preview.appendChild(smallDiv);



    });
    const paletteBtn=document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText='select';

    //attach event to the btn
    paletteBtn.addEventListener('click',e=>{
    closeLibrary();
    const paletteIndex=e.target.classList[1];
    initialColors=[];

     paletteObjects[paletteIndex].colors.forEach((color,index)=>{
        initialColors.push(color);
        colorDivs[index].style.backgroundColor=color;
        const text=colorDivs[index].children[0];
        checkTextContrast(color,text);
        updateTextUI(index);
     });
     resetInputs();
    });
    //appent to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette); 
        })
    }
}

getLocal();
randomColors();

// let randomHex=generateHex();
// console.log(randomHex);