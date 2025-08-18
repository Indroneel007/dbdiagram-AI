'use cliet'
import React from 'react'

type IdeProps = {
  ideAnswer: string;
};
const Ide: React.FC<IdeProps> = ({ideAnswer}) => {
  return(
    <>
      <h1>This is where our code will be written</h1>
    </>
  )
}

export default Ide