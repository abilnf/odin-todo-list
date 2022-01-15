import './index.css'

// var template = document.querySelector('#todo-card');
// var clone = template.content.cloneNode(true);
// document.querySelector('#content').appendChild(clone)


// const child = document.createElement('div')
// child.innerHTML = html
// document.querySelector('#content').appendChild(child)

document.querySelectorAll('.todo-card').forEach(card => {
  card.addEventListener('click', e => {
    const area = card.querySelector('.expandable-area')
    if (area.classList.contains('expandable-area--hidden')) {
      area.style.maxHeight = area.scrollHeight + "px";
    } else {
      area.style.maxHeight = null;
    }
    area.classList.toggle('expandable-area--hidden')
  })
})

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('click', e => {
    e.stopPropagation()
  })
})