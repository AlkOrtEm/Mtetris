/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable default-case */
import { useEffect, useState } from "react"
import uniqid from 'uniqid'
import { getElement, getColor } from "./elements"
import { componentProps, cords } from './types' 
import { getCurrentCords, getProperties, random, rotateCords, cordsToArray} from './utils'

export const CreateElement : React.FC<componentProps> = ({config, setBlocks, isFreeBlocks, onLose, active}) => {

  const [state, setState] = useState<{array:boolean[][], color:string}>({array:[], color:''})
    
  useEffect(() => {
    let element : cords[] = getElement()
    let color : string = getColor()
    let block : HTMLDivElement | null = document.querySelector('.animate')
    
    if(!block) return

    if(!active || !element){
      block.style.top = -160 + 'px'
      return
    }

    let {width, height} = getProperties(element)
    let offsetLeft : number =  random(config.columns - width)
    let offSetTop : number = -1
    let offSetTopPx : number = 0
    let count : number = 0

    block.style.left = offsetLeft * config.size +'px'
    
    setState({
      array : cordsToArray(element),
      color
    })

    const keyboardHandler = (e : KeyboardEvent) : void => {
    if(offSetTop > 0)
      switch (e.key) {
        case 'ArrowLeft':
          if(offsetLeft > 0 && isFreeBlocks(getCurrentCords(offSetTop, offsetLeft - 1, element)))
            offsetLeft -= 1
        break;
        case 'ArrowRight':
          if(
            offsetLeft + getProperties(element).width < config.columns && 
            isFreeBlocks(getCurrentCords(offSetTop, offsetLeft + 1, element))
          )
            offsetLeft += 1
        break;
        case ' ':
          const newCords : cords[] = rotateCords(element)
          if((offsetLeft + getProperties(newCords).width <= config.columns) && isFreeBlocks(newCords)){
            element = newCords
            setState({
              array: cordsToArray(newCords),
              color
            })
          }
        break;
      }
    }
      
    const onInterval = (): void => {
      offSetTopPx += config.step
      count++
      if(count + 1 === config.size / config.step){
        if(offSetTop < config.rows - 1 && isFreeBlocks(getCurrentCords(offSetTop+1, offsetLeft, element))){
          offSetTop += 1
        }else{
          if(offSetTop < height) onLose()
          offSetTopPx = 0
          setBlocks(getCurrentCords(offSetTop, offsetLeft, element), color)  
        }
        count = 0 
      }
      if(block){
        block.style.top = offSetTopPx + 'px'
        block.style.left = offsetLeft * config.size + 'px'
      }
    }

    let interval = setInterval(onInterval, config.interval)
    window.addEventListener('keydown', keyboardHandler)  

    return () => {
      window.removeEventListener('keydown', keyboardHandler) 
      interval && clearInterval(interval)
    }

  }, [active, config, setBlocks])

  return <div className='animate'>
      <div>{state.array.map(row => <Row row={row} color={state.color} key={uniqid()}/>)}</div>
    </div>
}

const Row : React.FC<{row : boolean[], color:string }> = ({row, color}) => <div className='r'>{
  row.map(fill => fill? <Square key={uniqid()} color={color}/>: <Empty key={uniqid()}/>)
}</div>

const Square : React.FC<{color : string}> = ({color}) => <div className={'square ' +color} ></div>
const Empty = () => <div className='offset' ></div>
