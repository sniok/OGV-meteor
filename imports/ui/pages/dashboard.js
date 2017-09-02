/*                     D A S H B O A R D . J S
 * BRL-CAD
 *
 * Copyright (c) 1995-2013 United States Government as represented by
 * the U.S. Army Research Laboratory.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 2.1 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this file; see the file named COPYING for more
 * information.
 */

/**
 * @file OGV/client/views/dashboard.js
 * @brief helpers and events for user/admin dashboard (dashboard.html)
 *
 * dashboard is place where normal users and admins can edit their
 * settings. This file contains logic required for dashboard
 */

import "./dashboard.html";

Template.dashboard.events({
  /**
     * When user form is submitted, upload the picture and save
     * the settings
     */
  "submit #dash-user-form": function(e) {
    e.preventDefault();

    const userDash = $(e.currentTarget),
      userBio = userDash.find("#dash-short-bio").val(),
      userName = userDash.find("#dash-username").val(),
      currentUser = Meteor.user(),
      saveSettings = function(picId) {
        /**
             * If user has not changed the profile picture then use
             * existing profile pic.
             */
        if (!picId) {
          picId = currentUser.profile.pic;
        }

        Meteor.users.update(
          currentUser._id,
          {
            $set: {
              "profile.bio": userBio,
              "profile.name": userName,
              "profile.pic": picId
            }
          },
          error => {
            if (error) {
              sAlert.error(
                "There was an error, Please fill all the fields correctly"
              );
            } else {
              sAlert.success("Settings saved");
            }
          }
        );
      };

    if (e.target[2].files[0]) {
      const fsFile = new FS.File(e.target[2].files[0]);
      fsFile.user = currentUser._id;

      const prevProfilePicture = ProfilePictures.findOne({
        user: currentUser._id
      });
      if (typeof prevProfilePicture !== "undefined") {
        ProfilePictures.remove(prevProfilePicture._id);
      }

      ProfilePictures.insert(fsFile, (err, dpFile) => {
        if (err) {
          sAlert.error(err.reason);
        } else {
          sAlert.success("Profile pic uploaded");
          saveSettings(dpFile._id);
        }
      });
    } else {
      saveSettings();
    }
  },

  /**
     * When admin form is submitted, get the values form the form
     * and update the settings.
     */
  "submit #dash-admin-form": function(e) {
    e.preventDefault();

    const adminDash = $(e.currentTarget),
      primaryBranding = adminDash.find("#dash-primary-branding").val(),
      mailUrl = adminDash.find("#dash-mail-url").val(),
      mgedPath = adminDash.find("#dash-mged-path").val(),
      gobjPath = adminDash.find("#dash-g-obj-path").val(),
      landingPageModel = adminDash.find("#dash-landingPageModel").val(),
      settings = OgvSettings.findOne();

    console.log(landingPageModel);
    OgvSettings.update(
      settings._id,
      {
        $set: {
          siteName: primaryBranding,
          mailUrl,
          mgedPath,
          gobjPath,
          landingPageModel
        }
      },
      error => {
        if (error) {
          sAlert.error(
            "There was an error, Please fill all the fields correctly"
          );
        } else {
          sAlert.success("Admin Settings saved");
        }
      }
    );
  }
});

Template.dashboard.helpers({
  settings() {
    return OgvSettings.findOne();
  }
});
