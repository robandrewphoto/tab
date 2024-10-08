document.addEventListener('DOMContentLoaded', () => {
    const tabContainer = document.querySelector('.tab-container');

    function enableEditing() {
        const lines = document.querySelectorAll('.editable');

        lines.forEach((line) => {
            line.addEventListener('keydown', function(event) {
                const sel = window.getSelection();
                const range = sel.getRangeAt(0);
                let cursorIndex = range.startOffset;

                if (/^\d$/.test(event.key)) {
                    const currentText = line.textContent;
                    // Check for previous character to see if it's also a digit
                    if (/^\d$/.test(currentText[cursorIndex - 1])) {
                        line.textContent = currentText.slice(0, cursorIndex) + event.key + currentText.slice(cursorIndex);
                        moveCursorToPosition(line, cursorIndex + 1);
                    } else {
                        line.textContent = currentText.slice(0, cursorIndex) + event.key + ' ' + currentText.slice(cursorIndex);
                        moveCursorToPosition(line, cursorIndex + 2);
                    }
                    alignNotesVertically();
                    event.preventDefault();
                } else if (!/[\w\s!@#$%^&*()\-+=<>?,./]/.test(event.key) &&
                    event.key !== 'Backspace' && event.key !== 'Delete' &&
                    event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                    event.preventDefault();
                }
            });

            line.addEventListener('click', function(event) {
                const clickedX = event.clientX;
                const lineRect = line.getBoundingClientRect();
                const charWidth = 20; // Assumed character width, adjust as needed
                const clickPosition = Math.floor((clickedX - lineRect.left) / charWidth);
                moveCursorToPosition(line, clickPosition);
            });
        });
    }

    function moveCursorToPosition(element, position) {
        const range = document.createRange();
        const sel = window.getSelection();
        const textNode = element.firstChild;
        const textLength = textNode ? textNode.length : 0;

        // Add spaces if the click position is beyond current text length
        for (let i = textLength; i < position; i++) {
            element.textContent += ' ';
        }

        range.setStart(textNode || element, Math.min(position, element.textContent.length));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    }

    function alignNotesVertically() {
        const lines = document.querySelectorAll('.editable');
        let maxLength = 0;

        lines.forEach(line => {
            if (line.textContent.length > maxLength) {
                maxLength = line.textContent.length;
            }
        });

        lines.forEach(line => {
            while (line.textContent.length < maxLength) {
                line.textContent += ' ';
            }
        });
    }

    function addNewLines() {
        const newSet = document.createElement('div');
        newSet.classList.add('set-of-lines');

        const annotation = document.createElement('div');
        annotation.classList.add('annotation');
        annotation.contentEditable = "true";
        newSet.appendChild(annotation);

        for (let i = 0; i < 6; i++) {
            const newLine = document.createElement('div');
            newLine.classList.add('string-line');
            newLine.innerHTML = '<div class="editable" contenteditable="true"></div>';
            newSet.appendChild(newLine);
        }

        tabContainer.appendChild(newSet); 
        enableEditing();
    }

    function clearAll() {
        const lines = document.querySelectorAll('.editable, .annotation');
        lines.forEach(line => {
            line.innerHTML = '';
        });
    }

    function exportPDF() {
        const { jsPDF } = window.jspdf;

        const annotations = document.querySelectorAll('.annotation');
        annotations.forEach(annotation => {
            annotation.classList.add('hide-border');
        });

        html2canvas(document.querySelector('#tabContainer'), { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF();
            doc.addImage(imgData, 'PNG', 10, 10, 180, 0);
            doc.save('tab_output_with_annotations.pdf');

            annotations.forEach(annotation => {
                annotation.classList.remove('hide-border');
            });
        });
    }

    function exportPNG() {
        const annotations = document.querySelectorAll('.annotation');
        annotations.forEach(annotation => {
            annotation.classList.add('hide-border');
        });

        html2canvas(document.querySelector('#tabContainer'), {
            backgroundColor: null,
            scale: 2
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'tab_output_with_annotations.png';
            link.click();

            annotations.forEach(annotation => {
                annotation.classList.remove('hide-border');
            });
        });
    }

    document.querySelector('#addLinesBtn').addEventListener('click', addNewLines);
    document.querySelector('#clearBtn').addEventListener('click', clearAll);
    document.querySelector('#exportPDFBtn').addEventListener('click', exportPDF);
    document.querySelector('#exportPNGBtn').addEventListener('click', exportPNG);

    enableEditing();
});
