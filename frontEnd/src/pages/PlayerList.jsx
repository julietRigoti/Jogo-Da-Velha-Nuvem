import React from 'react';
import styles from '../style/PlayerList.module.css';

const PlayerList = ({ players }) => {
    return (
        <div className={styles.listGroup}>
            <span className={styles.listTitle}>JOGADORES</span>

            {Object.keys(players).map((key) => (
                <div key={key} className={styles.listItem}>
                    {players[key].name}
                </div>
            ))}
        </div>
    );
};

export default PlayerList;