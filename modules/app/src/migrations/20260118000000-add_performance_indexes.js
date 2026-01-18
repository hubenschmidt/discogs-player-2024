'use strict';

module.exports = {
    up: async (queryInterface) => {
        // User table indexes
        await queryInterface.addIndex('User', ['Username'], {
            name: 'idx_user_username',
        });
        await queryInterface.addIndex('User', ['Email'], {
            name: 'idx_user_email',
        });

        // Release table indexes
        await queryInterface.addIndex('Release', ['Title'], {
            name: 'idx_release_title',
        });
        await queryInterface.addIndex('Release', ['Year'], {
            name: 'idx_release_year',
        });

        // Video table index
        await queryInterface.addIndex('Video', ['URI'], {
            name: 'idx_video_uri',
        });

        // Playlist table index
        await queryInterface.addIndex('Playlist', ['User_Id'], {
            name: 'idx_playlist_user_id',
        });

        // History table indexes
        await queryInterface.addIndex('History', ['User_Id'], {
            name: 'idx_history_user_id',
        });
        await queryInterface.addIndex('History', ['createdAt'], {
            name: 'idx_history_created_at',
        });

        // Join table indexes for better query performance
        await queryInterface.addIndex('ReleaseArtist', ['Release_Id'], {
            name: 'idx_release_artist_release',
        });
        await queryInterface.addIndex('ReleaseArtist', ['Artist_Id'], {
            name: 'idx_release_artist_artist',
        });

        await queryInterface.addIndex('ReleaseVideo', ['Release_Id'], {
            name: 'idx_release_video_release',
        });
        await queryInterface.addIndex('ReleaseVideo', ['Video_Id'], {
            name: 'idx_release_video_video',
        });

        await queryInterface.addIndex('ReleaseGenre', ['Release_Id'], {
            name: 'idx_release_genre_release',
        });
        await queryInterface.addIndex('ReleaseGenre', ['Genre_Name'], {
            name: 'idx_release_genre_name',
        });

        await queryInterface.addIndex('ReleaseStyle', ['Release_Id'], {
            name: 'idx_release_style_release',
        });
        await queryInterface.addIndex('ReleaseStyle', ['Style_Name'], {
            name: 'idx_release_style_name',
        });

        await queryInterface.addIndex('ReleaseLabel', ['Release_Id'], {
            name: 'idx_release_label_release',
        });
        await queryInterface.addIndex('ReleaseLabel', ['Label_Id'], {
            name: 'idx_release_label_label',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('User', 'idx_user_username');
        await queryInterface.removeIndex('User', 'idx_user_email');
        await queryInterface.removeIndex('Release', 'idx_release_title');
        await queryInterface.removeIndex('Release', 'idx_release_year');
        await queryInterface.removeIndex('Video', 'idx_video_uri');
        await queryInterface.removeIndex('Playlist', 'idx_playlist_user_id');
        await queryInterface.removeIndex('History', 'idx_history_user_id');
        await queryInterface.removeIndex('History', 'idx_history_created_at');
        await queryInterface.removeIndex('ReleaseArtist', 'idx_release_artist_release');
        await queryInterface.removeIndex('ReleaseArtist', 'idx_release_artist_artist');
        await queryInterface.removeIndex('ReleaseVideo', 'idx_release_video_release');
        await queryInterface.removeIndex('ReleaseVideo', 'idx_release_video_video');
        await queryInterface.removeIndex('ReleaseGenre', 'idx_release_genre_release');
        await queryInterface.removeIndex('ReleaseGenre', 'idx_release_genre_name');
        await queryInterface.removeIndex('ReleaseStyle', 'idx_release_style_release');
        await queryInterface.removeIndex('ReleaseStyle', 'idx_release_style_name');
        await queryInterface.removeIndex('ReleaseLabel', 'idx_release_label_release');
        await queryInterface.removeIndex('ReleaseLabel', 'idx_release_label_label');
    },
};
