import React from 'react';

const PlayerList = (props) => {
    console.log("Dados recebidos pelo PlayerList:", props.players);
        
    return (
        <div >
            {Object.keys(props.players)
                .map((key) => (
                    <div key={key}>{props.players[key].name}</div>
                ))
            }
        </div>
    );
};  

export default PlayerList;