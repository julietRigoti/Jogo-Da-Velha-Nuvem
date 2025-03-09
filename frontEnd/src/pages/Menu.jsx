import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, GameContext } from '../contexts/GameContext';
import imagemX from '../imagens/X.gif';
import imagemO from '../imagens/O.gif';
import stylesHome from '../style/Home.module.css';
import styleMenu from '../style/Menu.module.css';

const Menu = () => {
    const navigate = useNavigate();
    const { player, dispatch } = useContext(GameContext);

    const handleCreateRoom = async () => {
        await createRoom();
        // Atualiza o estado do jogador no contexto
        dispatch({ type: 'PLAYER', payload: { ...player, room: 'newRoomId' } });
        navigate(`/rooms`);
    };

    return (
        <div className={stylesHome.principalDiv}>
            <h1>Jogo da Velha</h1>
            <div className={styleMenu.menuContainer}>
                <button className={styleMenu.btnPrimary} onClick={handleCreateRoom}>Criar Sala</button>
                <button className={styleMenu.btnPrimary} onClick={() => navigate('/game-friend')}>Jogar com Amigo</button>
                <button className={styleMenu.btnPrimary}>Jogar com Aleatório</button>
            </div>

            <img
                className={stylesHome.imagemX}
                src={imagemX}
                alt='Pixelart tabuleiro com X'
            />
            <img
                className={stylesHome.imagemO}
                src={imagemO}
                alt='Pixelart tabuleiro com O'
            />
        </div>
    );
};

export default Menu;