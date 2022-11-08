local gears           = require("gears")
local lain            = require("lain")
local awful           = require("awful")
local wibox           = require("wibox")
local dpi             = require("beautiful.xresources").apply_dpi
local weather_widget  = require("awesome-wm-widgets.weather-widget.weather")
local cpu_widget      = require("awesome-wm-widgets.cpu-widget.cpu-widget")
local calendar_widget = require("awesome-wm-widgets.calendar-widget.calendar")
local todo_widget     = require("awesome-wm-widgets.todo-widget.todo")
local volume_widget   = require('awesome-wm-widgets.volume-widget.volume')

local string, os = string, os
local my_table = awful.util.table or gears.table -- 4.{0,1} compatibility

-- Lembrar que quando a documentação se referir a beautiful.<something> é aqui que devemos declarar com theme.<something>
-- Pois beautiful é a biblioteca de temas do awesomewm

local theme                                     = {}
theme.default_dir                               = require("awful.util").get_themes_dir() .. "default"
theme.icon_dir                                  = os.getenv("HOME") .. "/.config/awesome/themes/holo/icons"
theme.font                                      = "Roboto Bold 11"
theme.taglist_font                              = "Roboto Condensed Regular 13"
theme.fg_normal                                 = "#FFFFFF"
theme.fg_focus                                  = "#F0DE00"
theme.bg_focus                                  = "#FFFFFF3F"
theme.bg_normal                                 = "#0000009F"
theme.bg_tasklist                               = "#0000007F"
theme.bg_systray                                = "#1B2334"
theme.fg_urgent                                 = "#CC9393"
theme.bg_urgent                                 = "#af1d18"
theme.border_width                              = dpi(1)
theme.border_normal                             = "#00000000"
theme.border_focus                              = "#00000000"
theme.taglist_fg_focus                          = "#F0DE00"
theme.tasklist_fg_focus                         = "#F0DE00"
theme.tooltip_bg                                = "#FFFFFF3F"
theme.hotkeys_border_color                      = "#00000000"
theme.menu_height                               = dpi(20)
theme.menu_width                                = dpi(160)
theme.menu_icon_size                            = dpi(32)
theme.awesome_icon                              = theme.icon_dir .. "/awesome_icon_white.png"
theme.awesome_icon_launcher                     = theme.icon_dir .. "/awesome_icon.png"
theme.taglist_squares_sel                       = theme.icon_dir .. "/square_a.png"
theme.taglist_squares_unsel                     = theme.icon_dir .. "/square_b.png"
theme.spr_small                                 = theme.icon_dir .. "/spr_small.png"
theme.spr_very_small                            = theme.icon_dir .. "/spr_very_small.png"
theme.spr_right                                 = theme.icon_dir .. "/spr_right.png"
theme.spr_bottom_right                          = theme.icon_dir .. "/spr_bottom_right.png"
theme.spr_left                                  = theme.icon_dir .. "/spr_left.png"
theme.bar                                       = theme.icon_dir .. "/bar.png"
theme.bottom_bar                                = theme.icon_dir .. "/bottom_bar.png"
theme.mpdl                                      = theme.icon_dir .. "/mpd.png"
theme.mpd_on                                    = theme.icon_dir .. "/mpd_on.png"
theme.prev                                      = theme.icon_dir .. "/prev.png"
theme.nex                                       = theme.icon_dir .. "/next.png"
theme.stop                                      = theme.icon_dir .. "/stop.png"
theme.pause                                     = theme.icon_dir .. "/pause.png"
theme.play                                      = theme.icon_dir .. "/play.png"
theme.clock                                     = theme.icon_dir .. "/clock2.png"
theme.calendar                                  = theme.icon_dir .. "/cal.png"
theme.cpu                                       = theme.icon_dir .. "/cpu.png"
theme.net_up                                    = theme.icon_dir .. "/net_up2.png"
theme.net_down                                  = theme.icon_dir .. "/net_down2.png"
theme.layout_tile                               = theme.icon_dir .. "/tile.png"
theme.layout_tileleft                           = theme.icon_dir .. "/tileleft.png"
theme.layout_tilebottom                         = theme.icon_dir .. "/tilebottom.png"
theme.layout_tiletop                            = theme.icon_dir .. "/tiletop.png"
theme.layout_fairv                              = theme.icon_dir .. "/fairv.png"
theme.layout_fairh                              = theme.icon_dir .. "/fairh.png"
theme.layout_spiral                             = theme.icon_dir .. "/spiral.png"
theme.layout_dwindle                            = theme.icon_dir .. "/dwindle.png"
theme.layout_max                                = theme.icon_dir .. "/max.png"
theme.layout_fullscreen                         = theme.icon_dir .. "/fullscreen.png"
theme.layout_magnifier                          = theme.icon_dir .. "/magnifier.png"
theme.layout_floating                           = theme.icon_dir .. "/floating.png"
theme.layout_centerwork                         = theme.icon_dir .. "/centerworkw.png"
theme.layout_termfair                           = theme.icon_dir .. "/termfairw.png"
theme.layout_centerfair                         = theme.icon_dir .. "/centerfairw.png"
theme.tasklist_plain_task_name                  = true
theme.tasklist_disable_icon                     = true
theme.useless_gap                               = dpi(3)
theme.titlebar_close_button_normal              = theme.default_dir .. "/titlebar/close_normal.png"
theme.titlebar_close_button_focus               = theme.default_dir .. "/titlebar/close_focus.png"
theme.titlebar_minimize_button_normal           = theme.default_dir .. "/titlebar/minimize_normal.png"
theme.titlebar_minimize_button_focus            = theme.default_dir .. "/titlebar/minimize_focus.png"
theme.titlebar_ontop_button_normal_inactive     = theme.default_dir .. "/titlebar/ontop_normal_inactive.png"
theme.titlebar_ontop_button_focus_inactive      = theme.default_dir .. "/titlebar/ontop_focus_inactive.png"
theme.titlebar_ontop_button_normal_active       = theme.default_dir .. "/titlebar/ontop_normal_active.png"
theme.titlebar_ontop_button_focus_active        = theme.default_dir .. "/titlebar/ontop_focus_active.png"
theme.titlebar_sticky_button_normal_inactive    = theme.default_dir .. "/titlebar/sticky_normal_inactive.png"
theme.titlebar_sticky_button_focus_inactive     = theme.default_dir .. "/titlebar/sticky_focus_inactive.png"
theme.titlebar_sticky_button_normal_active      = theme.default_dir .. "/titlebar/sticky_normal_active.png"
theme.titlebar_sticky_button_focus_active       = theme.default_dir .. "/titlebar/sticky_focus_active.png"
theme.titlebar_floating_button_normal_inactive  = theme.default_dir .. "/titlebar/floating_normal_inactive.png"
theme.titlebar_floating_button_focus_inactive   = theme.default_dir .. "/titlebar/floating_focus_inactive.png"
theme.titlebar_floating_button_normal_active    = theme.default_dir .. "/titlebar/floating_normal_active.png"
theme.titlebar_floating_button_focus_active     = theme.default_dir .. "/titlebar/floating_focus_active.png"
theme.titlebar_maximized_button_normal_inactive = theme.default_dir .. "/titlebar/maximized_normal_inactive.png"
theme.titlebar_maximized_button_focus_inactive  = theme.default_dir .. "/titlebar/maximized_focus_inactive.png"
theme.titlebar_maximized_button_normal_active   = theme.default_dir .. "/titlebar/maximized_normal_active.png"
theme.titlebar_maximized_button_focus_active    = theme.default_dir .. "/titlebar/maximized_focus_active.png"

local markup = lain.util.markup
local blue   = "#80CCE6"
local space3 = markup.font("Roboto 3", " ")

-- Clock
local mytextclock = wibox.widget.textclock(markup("#FFFFFF", "%A %d %B ") ..
    markup("#FFFFFF", ">") .. markup("#FFFFFF", " %H:%M "))
mytextclock.font = theme.font
local get_clock_icon = wibox.widget.imagebox(theme.clock)
local clock_icon = wibox.container.margin(get_clock_icon, dpi(0), dpi(0), dpi(5), dpi(5))
local clockwidget = wibox.container.margin(mytextclock, dpi(0), dpi(0), dpi(0), dpi(3))

-- Calendar
local cw = calendar_widget({
    theme = 'dark',
    placement = 'top_right',
    start_sunday = true,
    radius = 8,
    -- with customized next/previous (see table above)
    previous_month_button = 1,
    next_month_button = 3,
})
mytextclock:connect_signal("button::press",
    function(_, _, _, button)
        if button == 1 then cw.toggle() end
    end)



-- / fs
theme.fs = lain.widget.fs({
    notification_preset = { bg = theme.bg_normal, font = "Monospace 9" },
})


-- ALSA volume bar
theme.volume = lain.widget.alsabar({
    notification_preset = { font = "Monospace 9" },
    --togglechannel = "IEC958,3",
    width = dpi(80), height = dpi(5),
    colors = {
        background = "#383838",
        unmute     = "#FFFFFF",
        mute       = "#FF9F9F"
    },
})
theme.volume.bar.paddings = dpi(0)
theme.volume.bar.margins = dpi(5)
volumewidget = wibox.container.margin(theme.volume.bar, dpi(0), dpi(0), dpi(5), dpi(5))

-- Net
local get_netdown_icon = wibox.widget.imagebox(theme.net_down)
local get_netup_icon = wibox.widget.imagebox(theme.net_up)
local net = lain.widget.net({
    settings = function()
        widget:set_markup(markup.font("Roboto 1", " ") .. markup.font(theme.font, net_now.received .. " - "
            .. net_now.sent) .. markup.font("Roboto 2", " "))
    end
})
local networkwidget = wibox.container.margin(net.widget, dpi(0), dpi(0), dpi(0), dpi(2))
local netup_icon = wibox.container.margin(get_netup_icon, dpi(0), dpi(0), dpi(5), dpi(5))
local netdown_icon = wibox.container.margin(get_netdown_icon, dpi(0), dpi(0), dpi(5), dpi(5))


-- Weather
--[[ to be set before use
theme.weather = lain.widget.weather({
    --APPID =
    city_id = 2643743, -- placeholder (London)
    notification_preset = { font = "Monospace 9", position = "bottom_right" },
})
--]]

-- Launcher
local mylauncher = awful.widget.button({ image = theme.awesome_icon_launcher })
mylauncher:connect_signal("button::press", function() awful.util.mymainmenu:toggle() end)

-- Separators
local first               = wibox.widget.textbox('<span font="Roboto 14"> </span>')
local sep_big_ball        = wibox.widget.imagebox(theme.icon_dir .. "/sep_big_ball.png")
local sep_little_ball     = wibox.widget.imagebox(theme.icon_dir .. "/sep_little_ball.png")
local sep_big_circle      = wibox.widget.imagebox(theme.icon_dir .. "/sep_big_circle.png")
local sep_little_circle   = wibox.widget.imagebox(theme.icon_dir .. "/sep_little_circle.png")
local sep_thic_big_bar    = wibox.widget.imagebox(theme.icon_dir .. "/sep_thic_big_bar.png")
local sep_thic_small_bar  = wibox.widget.imagebox(theme.icon_dir .. "/sep_thic_small_bar.png")
local sep_thin_bar        = wibox.widget.imagebox(theme.icon_dir .. "/sep_thin_bar.png")
local sep_thin_little_bar = wibox.widget.imagebox(theme.icon_dir .. "/sep_thin_little_bar.png")


function theme.at_screen_connect(s)
    -- Some Icons
    local get_mpd_icon = wibox.widget.imagebox(theme.icon_dir .. "/mpd.png")
    local mpd_icon = wibox.container.margin(get_mpd_icon, dpi(0), dpi(0), dpi(5), dpi(5))

    -- Quake application
    s.quake = lain.util.quake({ app = awful.util.terminal })

    -- My Systray Configuration
    local get_my_systray = wibox.widget.systray()
    local my_systray = wibox.container.margin(get_my_systray, dpi(0), dpi(0), dpi(4), dpi(4))

    -- My Weather Configuration
    local get_my_weather = weather_widget({
        coordinates = { -15.670412, -58.096426 },
        api_key = '2329ca9c510c73633847edc3b6e83515',
        font_name = 'Montserrat',
        both_units_widget = false,
        units = 'metric',
        show_hourly_forecast = true,
        time_format_12h = false,
        show_daily_forecast = true,
        icons = 'weather-underground-icons',
        icons_extension = '.png',
        timeout = 300,
    })
    local my_weather = wibox.container.margin(get_my_weather, dpi(0), dpi(0), dpi(3), dpi(3))

    local get_my_todo = todo_widget()
    local my_todo = wibox.container.margin(get_my_todo, dpi(0), dpi(0), dpi(3), dpi(3))

    -- Tags
    awful.tag(awful.util.tagnames, s, awful.layout.layouts)

    -- Create a promptbox for each screen
    s.mypromptbox = awful.widget.prompt()
    -- Create an imagebox widget which will contains an icon indicating which layout we're using.
    -- We need one layoutbox per screen.
    s.mylayoutbox = awful.widget.layoutbox(s)
    s.mylayoutbox:buttons(my_table.join(
        awful.button({}, 1, function() awful.layout.inc(1) end),
        awful.button({}, 2, function() awful.layout.set(awful.layout.layouts[1]) end),
        awful.button({}, 3, function() awful.layout.inc(-1) end),
        awful.button({}, 4, function() awful.layout.inc(1) end),
        awful.button({}, 5, function() awful.layout.inc(-1) end)))
    local get_mylayoutbox = wibox.container.margin(s.mylayoutbox, dpi(0), dpi(5), dpi(4), dpi(4))
    -- Create a taglist widget
    s.mytaglist = awful.widget.taglist(s, awful.widget.taglist.filter.all, awful.util.taglist_buttons, {font = "Roboto Mono"})
    s.mytag = wibox.container.margin(s.mytaglist, dpi(0), dpi(0), dpi(0), dpi(1))

    -- Create a tasklist widget
    s.get_mytasklist = awful.widget.tasklist(s, awful.widget.tasklist.filter.currenttags, awful.util.tasklist_buttons,
        { bg_normal = theme.bg_tasklist, bg_focus = theme.bg_focus, shape = gears.shape.rounded_rect, align = "center",
            spacing = 3})
    s.mytasklist = wibox.container.margin(s.get_mytasklist, dpi(10), dpi(10), dpi(4), dpi(2))
    -- Create the top wibox
    s.mywibox = awful.wibar({ position = "top", screen = s, height = dpi(27) })

    -- Add widgets to the top wibox
    s.mywibox:setup {
        layout = wibox.layout.align.horizontal,
        { -- Left widgets
            layout = wibox.layout.fixed.horizontal,
            first,
            s.mytag,
            s.mypromptbox,
        },
        nil, -- Middle widget
        { -- Right widgets
            layout = wibox.layout.fixed.horizontal,
            netdown_icon,
            first,
            networkwidget,
            first,
            netup_icon,
            sep_thin_little_bar,
            cpu_widget({
                width = 70,
                step_width = 2,
                step_spacing = 1,
                color = theme.fg_focus,
                enable_kill_button = true,
                timeout = 1,
            }),
            sep_thin_little_bar,
            volume_widget {
                widget_type = 'arc',
                thickness = 2,
            },
            volumewidget,
            sep_thin_little_bar,
            my_weather,
            sep_thin_little_bar,
            my_todo,
            sep_thin_little_bar,
            first,
            clock_icon,
            first,
            clockwidget,
            sep_thin_little_bar,
            my_systray,
        },
    }

    -- Create the bottom wibox
    s.mybottomwibox = awful.wibar({ position = "bottom", screen = s, border_width = dpi(0), height = dpi(27),
        bg = theme.bg_normal })
    s.borderwibox = awful.wibar({ position = "bottom", screen = s, height = dpi(1), x = dpi(0), y = dpi(33) })

    -- Add widgets to the bottom wibox
    s.mybottomwibox:setup {
        layout = wibox.layout.align.horizontal,
        { -- Left widgets
            layout = wibox.layout.fixed.horizontal,
            -- mylauncher,
        },
        s.mytasklist, -- Middle widget
        { -- Right widgets
            layout = wibox.layout.fixed.horizontal,
            get_mylayoutbox,
        },
    }
end

return theme
