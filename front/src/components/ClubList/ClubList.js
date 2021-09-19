import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import Club from '../Club/Club';
import './clubs.css'

function ClubList(props) {
  
  const dispatch = useDispatch();
  const clubs = useSelector(state => state.clubs?.clubs);
console.log(clubs);
  useEffect(() => {
    fetch('http://localhost:4000/api/clublist', { credential: true })
    .then((res) => res.json())
    .then((data) => dispatch({ type: 'INIT_CLUBS', payload: data }))
  }, [dispatch])


  return (
    <div className="container">
      {clubs?.map((club) => <Club id={club.id} club={club} />)}
    </div>
  );
}

export default ClubList;
