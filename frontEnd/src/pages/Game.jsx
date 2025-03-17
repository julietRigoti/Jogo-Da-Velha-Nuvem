import React, { useContext } from "react";
import PlayerList from './PlayerList';
import Chat from "./Chat";
import { GameContext, sendMessage } from '../contexts/GameContext';
import Rooms from "./Rooms";
import JogoVelha from "./JogoVelha";
import styles from "../style/Game.module.css";

const Game = () => {
    const { isConnected, players, messages, match } = useContext(GameContext);
    console.log(match);

    return (
        <div className={styles.gameContainer}>
            {!isConnected &&
                <div className={styles.connectingMessage}>Conectando...</div>
            }

            {match.status ? (
                <JogoVelha />
            ) : (
                <div className={styles.gameContent}>
                    <div className={styles.listContainer}>
                        <Rooms />
                        <PlayerList players={players} />
                    </div>
                    <Chat sendMessage={sendMessage} messages={messages} />
                </div>
            )}
        </div>
    );
};

export default Game;