import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from '../controllers/playlist.controllers.js';
import {upload} from '../middlewares/multer.middleware.js'
const playlistRouter = Router();
playlistRouter.use(verifyJWT);

playlistRouter.route("/")
.post(upload.none(),createPlaylist)
.get(getUserPlaylists);

playlistRouter.route("/:playlistId")
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(updatePlaylist);

playlistRouter.route("/:playlistId/:videoId")
.delete(removeVideoFromPlaylist)
.post(addVideoToPlaylist);


export {playlistRouter};