import express from 'express';
import {
    AddMovie, 
    updateMovie, 
    deleteMovie
} from '../controller/movieController'
import {auth} from "../middlewares/auth"
const router = express.Router();


router.post('/add', auth, AddMovie);
router.patch('/update-movies/:id', auth, updateMovie);
router.delete('/delete-movies/:id', auth, deleteMovie);

export default router;
