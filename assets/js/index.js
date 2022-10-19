function fillemail(){
    
    const subject = document.querySelector('.subject').value;
    const message = document.querySelector('.message').value;


    const email= document.querySelector('.emailaddress');

    email.href=`mailto:l.deroin@netcourrier.com?subject=${subject}&body=${message}`

    email.click();
        
}