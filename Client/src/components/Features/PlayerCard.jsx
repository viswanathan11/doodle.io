import React from 'react'

const PlayerCard = ({username,score,rank,color,isDrawing,hasGuessed}) => {
  return (
    <div style={{
      display:'flex',
      allignItems:'center',
      justifyContent:'space-between',
      padding:'8px 10px',
      backgroundColor:hasGuessed?'#d4edda':"#ffffffff",
      border:'2px solid #000',
      borderRadius:'7px',
      boxShadow:'3px 3px 0px #000',
    }}>
      {/* Rank and avatar area */}
      <div style={{
        display:'flex',
        alignItems:'center',
        gap:'8px'
      }}><span style={{fontWeight:'bold',
        fontSize:'1.2rem',
        color:'#333'
      }}>#{rank}</span></div>
      {/* Color Avatar Box/Circle */}
      <div style={{
      width:'40px',
      height:'40px',
      backgroundColor:color||"#ccc",
      border:'2px solid #000',
      borderRadius:'50%'
      }}></div>

      {/* Name ans Score */}
      <div style={{
        display:'flex',
        flexDirection:'column'
      }}>
        <span style={{fontWeight:'bold',fontsize:'1.5rem',
        minWidth:'80px',
        overflow:'hidden',
        textOverflow:'ellipsis',
        whiteSpace:'nowrap'
        }}>{username||"#USERNAME"}
        </span>
        <span style={{fontSize:'1rem',color:'#555'}}>
          {score||"#000"}
        </span>
      </div>
      <div style={{fontsize:'1rem',
        marginRight:'1px'
      }}>
        {isDrawing && '✏️'}
        {hasGuessed && '✔️'}
      </div>
      </div>
  )
}

export default PlayerCard