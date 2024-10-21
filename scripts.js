
        let cursorIndex = 0;
        let selectedNotes = [];

        function enableEditing() {
            const lines = document.querySelectorAll('.editable');

            lines.forEach((line, index) => {
                line.classList.add('unselectable'); // make lines unselectable

                line.addEventListener('keydown', function(event) {
                    const sel = window.getSelection();
                    const range = sel.getRangeAt(0);
                    cursorIndex = range.startOffset;

                    if (!/[\w\s!@#$%^&*()\-+=<>?,./]/.test(event.key) &&
                        event.key !== 'Backspace' && event.key !== 'Delete' &&
                        event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                        event.preventDefault();
                    }
                });

                line.addEventListener('click', function(event) {
                    const clickedX = event.clientX;
                    const lineRect = line.getBoundingClientRect();
                    cursorIndex = 0;
                    const charWidth = 50;
                    const clickPosition = Math.floor((clickedX - lineRect.left) / charWidth);
                    cursorIndex = clickPosition;
                    moveToPositionWithManualSpaces(line, cursorIndex);

                    if (event.shiftKey) {
                        toggleNoteSelection(line, cursorIndex);
                    } else {
                        clearNoteSelection();
                        toggleNoteSelection(line, cursorIndex);
                    }
                });
            });
        }

        function moveToPositionWithManualSpaces(element, position) {
            const currentLength = element.textContent.length;
            for (let i = currentLength; i < position; i++) {
                element.textContent += ' ';
            }
            placeCursorAtPosition(element, position);
        }

        function placeCursorAtPosition(element, position) {
            const range = document.createRange();
            const sel = window.getSelection();
            const textLength = element.textContent.length;
            range.setStart(element.childNodes[0] || element, Math.min(position, textLength));
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            element.focus();
        }

        function toggleNoteSelection(line, index) {
            const text = line.textContent;
            const note = text.charAt(index);

            if (note !== ' ' && note !== '') {
                const span = document.createElement('span');
                span.classList.add('selected-note');
                span.textContent = note;

                line.textContent = text.slice(0, index) + text.slice(index + 1);
                line.insertBefore(span, line.childNodes[index] || null);
                selectedNotes.push(span);
            }
        }

        function clearNoteSelection() {
            selectedNotes.forEach(span => {
                const parent = span.parentNode;
                const text = span.textContent;
                const index = Array.prototype.indexOf.call(parent.childNodes, span);
                parent.removeChild(span);
                parent.textContent = parent.textContent.slice(0, index) + text + parent.textContent.slice(index);
            });
            selectedNotes = [];
        }

        function addNewLines() {
            const tabContainer = document.querySelector('.tab-container');
            
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

        enableEditing();
