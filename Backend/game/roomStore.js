// In-memory store for active game rooms
// It will look something like this when populated:
// rooms['ABC123'] = {
//   players: [...],
//   state: 'waiting',  // waiting, word_selection, drawing, round_end, game_over
//   currentWord: 'elephant',
//   timer: null
// }

const rooms = {
    "ABC123": {

        players: [{
            id: 1,
            name: 'Viswa'
        }, {
            id:2,
            name:"MindGrinder"
        },{
            id:3,
            name:"TheAnonymous"
        }]
    }
};

export default rooms;
