"""One-off seed of the first batch of blog posts, written up-front as part of shipping the
blog platform. update_or_create on slug, so it's safe to re-run (e.g. after editing an
article's copy in this file) without creating duplicates. Posts are seeded as status='draft' -
review in the admin and flip to 'published' (with a published_at date) when ready to go live.

Run: python manage.py seed_blog_posts
"""

from django.core.management.base import BaseCommand

from blog.models import Post

POSTS = [
    {
        'title': "What Is Expected Goals (xG) in Floorball? A Coach's Guide",
        'slug': 'what-is-expected-goals-xg-in-floorball',
        'category': 'analytics-101',
        'excerpt': (
            "Expected goals (xG) estimates how good a scoring chance really was, separate from "
            "whether it went in. Here's what it means, how it's calculated, and how to use it."
        ),
        'meta_description': (
            "What is xG in floorball? A plain-language guide to expected goals: how it's "
            "calculated, why it matters more than the scoreboard, and how coaches use it."
        ),
        'faq': [
            {
                'question': 'Is a higher xG always better?',
                'answer': (
                    "For your own team's attack, generally yes - more and better chances. For "
                    "shots you allow, lower is better. But a single game's xG is noisy: one "
                    "unlucky bounce or a hot goalkeeper can swing the scoreboard without "
                    "changing the underlying process. xG earns its value over many games, not one."
                ),
            },
            {
                'question': 'How is xG calculated?',
                'answer': (
                    "Models estimate a shot's goal probability from its location on the rink "
                    "(distance and angle to goal) and its situation (even strength, power play, "
                    "shorthanded, or the shooting team's own goalie pulled), trained on "
                    "historical shot outcomes. Floorball Scanner's model is built on floorball "
                    "shot data specifically, not adapted from ice hockey."
                ),
            },
            {
                'question': 'Can a team have a good record with bad xG?',
                'answer': (
                    "Yes - it usually signals a hot-shooting or hot-goaltending stretch, which "
                    "tends to regress over a season. Seeing that gap early, rather than after "
                    "it corrects at an inconvenient time, is exactly what xG is for."
                ),
            },
        ],
        'body': """\
> **Key takeaways**
>
> - xG estimates the probability that a shot becomes a goal, based on where it was taken from and
>   the game situation.
> - The scoreboard tells you what happened; xG tells you how it was earned.
> - A team can outscore (or undershoot) its xG for a stretch of games without it being sustainable.
> - Comparing actual goals to xG (goals minus expected goals, or "GAxG") is one of the simplest
>   ways to spot who's running hot or cold.

## What Does "Expected Goals" Actually Mean?

Every shot in floorball is not created equal. A one-timer from the slot after a cross-ice pass is
a much better chance than a low-percentage attempt from a bad angle on the boards - but a
traditional box score treats them identically: one shot, one entry in the "S" column.

Expected goals (xG) fixes that by assigning each shot a probability of becoming a goal, based on
where it was taken from and the situation it was taken in. A breakaway might carry an xG of 0.6
(a 60% chance of scoring); a long shot through traffic might be 0.03. Add up every shot's xG over
a game or a season and you get a number that represents *the quality of chances created*, not just
their quantity.

This matters because goals themselves are a small-sample, high-variance statistic. A team can
generate excellent chances all night and lose 1-0 to a hot goalkeeper, or create almost nothing and
win 4-1 off a couple of lucky bounces. xG is the underlying signal underneath that noise.

## How Is xG Calculated in Floorball?

xG models are built by looking at a large sample of historical shots and their outcomes (goal or
no goal), then finding the patterns that separate high-probability shots from low-probability ones.
The two biggest factors are almost always:

- **Distance and angle to goal** - a shot from the slot has a dramatically better chance than the
  same shot from a sharp angle near the boards.
- **Situation** - an even-strength shot, a power-play shot, a shorthanded shot, and a shot against
  a pulled goalie (6-on-5) all carry different baseline probabilities, even from the same spot on
  the rink.

It's worth being specific here: a floorball xG model needs to be trained on floorball shot data.
Rink dimensions, goal size, shot speed, and defensive structure are different enough from ice
hockey that simply reusing a hockey xG model would misprice almost every shot. Floorball
Scanner's model is built from the ground up on floorball shot locations and outcomes.

## Why Coaches Care About xG More Than the Scoreboard

The scoreboard answers one question: who won tonight. xG answers a more useful one for a coach
planning next week's practice: **who is actually generating and preventing good chances,
regardless of whether the puck went in.**

That distinction shows up constantly:

- A team can be dominating the underlying play (high xG for, low xG against) while trailing on the
  scoreboard - a sign the result will likely turn if that process continues.
- A team can be winning while getting badly outchanced - worth knowing before it's mistaken for a
  system that's working.
- An individual line can be quietly controlling play even on a night the top line gets all the
  points.

None of that is visible in goals and assists alone. It's visible in xG.

## What Is GAxG (Goals vs. Expected)?

One of the simplest and most useful derived numbers is **GAxG**: actual goals scored minus xG. A
team (or a player) with a strongly positive GAxG is finishing well above what their chances
"should" produce - either genuinely clinical finishing, or a hot streak that's unlikely to hold. A
strongly negative GAxG usually means the process is fine but the puck isn't going in - which, more
often than not, is a sign of better results coming, not worse ones.

This is exactly the same idea hockey analysts call "shooting percentage luck," applied to
floorball. It doesn't mean finishing skill doesn't exist - some players genuinely shoot better than
average over a full season - but a small sample of games swinging wildly above or below zero is far
more often variance than a real, lasting shift in ability.

## The Limits of xG: What It Doesn't Tell You

xG is a process metric, not a verdict. A few things worth keeping in mind:

- **It's a model, not a certainty.** Every shot gets a probability, not a guarantee - some low-xG
  shots will go in, and that's expected, not a model failure.
- **One game is a small sample.** A single match's xG can still be misleading; it becomes far more
  reliable pooled across many games, the same way a player's shooting percentage means more over a
  season than over one night.
- **It doesn't replace watching the game.** xG tells you a chance was good; it doesn't tell you
  *why* - a missed defensive assignment, a great individual play, a lucky bounce off a stick. That
  context still has to come from film and live viewing.

## How to Start Using xG in Your Own Coaching

In practice, most coaches get the most value from three simple habits:

1. **Track xG for and against by line**, not just by team - it's often the fastest way to spot
   which matchups are actually working.
2. **Watch the gap between goals and xG (GAxG)** over a rolling stretch of games, rather than
   reacting to any single result.
3. **Use it pregame**, not just postgame - knowing an upcoming opponent's shot-quality tendencies
   (where they generate their chances from) is direct input into a scouting plan.

If you want to see this tracked automatically, live, for every match rather than calculating it by
hand, that's exactly what [Floorball Scanner's F-Liiga tracking](/f-liiga/) does - xG, shot maps,
and a full breakdown by team, line, and player, updating as the game happens. See the
[Floorball Analytics Glossary](/blog/floorball-analytics-glossary-xg-gsax-and-other-kpis/) next for
a rundown of the other KPIs that go alongside xG.
""",
    },
    {
        'title': 'Floorball Analytics Glossary: xG, GSAx, Plus/Minus, and Other Key KPIs Explained',
        'slug': 'floorball-analytics-glossary-xg-gsax-and-other-kpis',
        'category': 'analytics-101',
        'excerpt': (
            "A plain-language reference for the analytics terms floorball coaches actually "
            "need: xG, xGOT, GSAx, plus/minus, save percentage, and more."
        ),
        'meta_description': (
            "A floorball analytics glossary: xG, xGOT, GSAx, plus/minus, save percentage, and "
            "power play/penalty kill rate - what each KPI means and why it matters."
        ),
        'faq': [
            {
                'question': "What's the difference between xG and xGOT?",
                'answer': (
                    "xG covers every shot attempt, including ones that miss the net entirely or "
                    "get blocked. xGOT (expected goals on target) only counts shots that actually "
                    "tested the goalkeeper. A team with high xG but low xGOT is generating good "
                    "chances but not hitting the net with them - a real, fixable issue in its own "
                    "right, separate from the shot quality itself."
                ),
            },
            {
                'question': 'Is plus/minus a reliable stat on its own?',
                'answer': (
                    "It's a useful team-context signal, but it's heavily influenced by linemates, "
                    "deployment, and luck - a player can be on the ice for a great chance that "
                    "happens to go in, or a bad shift that happens not to. It's most reliable "
                    "combined with individual, on-ball numbers like points and xG contribution, "
                    "not read alone."
                ),
            },
            {
                'question': 'What counts as a good save percentage in floorball?',
                'answer': (
                    "It depends heavily on the level and the shot quality a goalie actually "
                    "faces, which is exactly why raw save percentage alone is limited - a goalie "
                    "facing tougher, higher-xG shots will have a lower save percentage than one "
                    "facing easy ones, even if they're the better goaltender. GSAx accounts for "
                    "that by comparing saves to shot quality faced."
                ),
            },
        ],
        'body': """\
> **Key takeaways**
>
> - xG and xGOT measure shot quality; GSAx measures a goalie's performance against that quality.
> - Plus/minus is a team-context stat, best read alongside individual, on-ball numbers.
> - Special-teams rates (power play %, penalty kill %) are volatile in small samples - track them
>   over a stretch of games, not one.
> - None of these numbers replace watching the game - they tell you *where* to look.

This is a working reference for the KPIs that come up most often in floorball analytics - short,
plain-language definitions, not a statistics textbook. For a deeper walkthrough of the single most
important one, see [What Is Expected Goals (xG) in Floorball?](/blog/what-is-expected-goals-xg-in-floorball/)

## Shot Quality Metrics

### xG (Expected Goals)

The probability that a given shot becomes a goal, based on its location and game situation. Summed
across a game or season, it represents the quality of chances a team or player created - the
foundation nearly every other metric on this list builds on.

### xGOT (Expected Goals on Target)

The same idea as xG, but restricted to shots that actually reached the goalkeeper (excluding shots
that missed the net or were blocked). Comparing a team's xG to its xGOT is a good way to separate
two different problems: *not getting good enough looks* (low xG) versus *not hitting the net with
the looks you get* (a big gap between xG and xGOT).

### GAxG (Goals vs. Expected)

Actual goals scored minus xG. A large positive number usually means hot finishing (which tends not
to last); a large negative number usually means the process is sound but the puck isn't going in
yet (which, more often than not, is a sign of better results coming).

## Goaltending

### GSAx (Goals Saved Above Expected)

A goalie's expected goals against (based on the shots they actually faced) minus the goals they
actually allowed. A positive GSAx means the goalie stopped more than a league-average goalie would
be expected to, given the shot quality they faced - which is the key improvement over raw save
percentage: it adjusts for how hard the shots they faced actually were.

### Save Percentage

Saves divided by shots on target. Simple and familiar, but blunt on its own - a goalie facing
mostly low-danger shots will post a higher save percentage than an equally good goalie facing
harder chances, purely because of what they're up against. Best read alongside GSAx, not instead
of it.

## Individual Skater Metrics

### Points (Goals + Assists)

The most familiar counting stat, and still a real signal of production - but it says nothing about
*how* those points were generated (a great individual play vs. a favorable bounce), and it's silent
on defense entirely.

### Plus/Minus

Goals scored while a player is on the ice, minus goals conceded while they're on the ice. It
captures team-context defensive/offensive impact that points alone miss, but it's heavily shaped by
linemates and deployment - a strong player can post a mediocre plus/minus on a weak line, and vice
versa. Most useful alongside individual, on-ball numbers (points, xG contribution) rather than read
in isolation.

### 5v5 xG Contribution

A player's own xG generated at even strength - isolates a player's shot-quality involvement from
special teams and from teammates' finishing, which raw points can't do.

## Special Teams

### Power Play % / Penalty Kill %

Goals scored per power-play opportunity, and the inverse for penalty kill. Both are genuinely
important, but volatile over small samples - a team can look excellent or terrible on special
teams over a handful of games purely from variance in a low-frequency situation. Track these over
a meaningful stretch (several weeks, not one game) before drawing conclusions.

## Win Probability

A live, in-game estimate of each team's chance of winning, updated as the score and xG battle
evolve. Useful for identifying the moments that actually swung a game - a goal scored down 3-0 late
moves win probability far less than the same goal scored in a tied third period, even though both
are "one goal" in the box score.

---

Every one of these is tracked automatically, live, for F-Liiga matches on
[Floorball Scanner](/f-liiga/) - by team, by line, and by individual player - so you're not
calculating any of it by hand. For the practical side of turning these numbers into a game plan,
see [How to Use Match Data to Prepare for Your Next Opponent](/blog/how-to-use-match-data-to-prepare-for-your-next-opponent/).
""",
    },
    {
        'title': 'How to Use Match Data to Prepare for Your Next Opponent',
        'slug': 'how-to-use-match-data-to-prepare-for-your-next-opponent',
        'category': 'coaching-guides',
        'excerpt': (
            "A practical, step-by-step approach to scouting an upcoming opponent with match "
            "data - what to look at, in what order, and how it should change your game plan."
        ),
        'meta_description': (
            "A practical guide for floorball coaches: how to use match data - xG, line "
            "performance, special teams - to prepare a game plan for your next opponent."
        ),
        'faq': [
            {
                'question': 'How many games of data do I need before scouting an opponent?',
                'answer': (
                    "More is better, but even 3-5 recent games is enough to spot real patterns "
                    "in shot location tendencies and line matchups - just weight very recent "
                    "form (last 1-2 games) more heavily than older results, since lineups and "
                    "tactics shift over a season."
                ),
            },
            {
                'question': 'Should I prepare differently for a team with a good record but bad underlying numbers?',
                'answer': (
                    "Yes - that's often the most useful thing data-based scouting reveals. A "
                    "team winning despite being outchanced (poor xG for/against) is more "
                    "beatable than its record suggests, and knowing that going in changes how "
                    "confidently you can play your own game rather than over-respecting the "
                    "scoreboard."
                ),
            },
            {
                'question': 'What should I actually change in a game plan based on this data?',
                'answer': (
                    "The most common, concrete adjustments are: which of your lines you match "
                    "against their most dangerous line, where you tell your defense to funnel "
                    "shots away from (based on where the opponent creates their best chances "
                    "from), and how aggressively to attack on special teams based on their "
                    "actual PP/PK rates rather than reputation."
                ),
            },
        ],
        'body': """\
> **Key takeaways**
>
> - Start with the underlying numbers (xG for/against), not just the record - a team can be
>   winning while getting outchanced, or losing while dominating play.
> - Look at line-by-line performance, not just team totals, to plan matchups.
> - Check shot location tendencies to know where an opponent generates their chances from.
> - Special-teams rates matter, but weight recent games more than season-long averages.

Most floorball coaches already watch film before a big game. Match data doesn't replace that - it
tells you *where to look* before you start watching, so the film session finds what actually
matters instead of just what happened to stand out in the last game you saw live.

Here's a practical order to work through when prepping for an upcoming opponent.

## Step 1: Check the Record Against the Underlying Numbers

Start with the basics - record, goals for, goals against - then immediately check it against xG
for and xG against. The gap between the two tells you something the record alone can't:

- **Good record, good xG**: a genuinely strong team. Respect it.
- **Good record, bad xG**: winning despite being outchanced - often more beatable than the
  standings suggest, and a team that may be due for a correction.
- **Bad record, good xG**: a team getting unlucky or facing tough goaltending - more dangerous
  than their record implies, and one you shouldn't underestimate just because they're near the
  bottom of the table.

This single check resets expectations before anything else, and it's the fastest way to avoid
either over- or under-respecting an opponent based on the scoreboard alone.

## Step 2: Break It Down by Line

Team totals hide a lot. A team's overall xG can look average while one specific line is doing
almost all of the damage, and the others are being comfortably contained. Look at each line's xG
for and against individually:

- Which line is generating the most dangerous chances? That's the matchup question for your own
  bench - do you want your best defensive line against them, or are you comfortable letting a
  secondary line handle it?
- Which of their lines is getting outchanged? That's where you want to direct pressure, and where
  your own secondary scoring has the best chance of getting results.

## Step 3: Look at Where Their Chances Come From

Shot location data (a shot map) shows you *where* on the rink a team generates its offense - heavy
slot traffic, point shots with screens, rush chances off the wing, and so on. This turns into a
concrete defensive instruction, not just a general "play tight defense" reminder:

- A team that lives off slot chances needs tight net-front coverage as the priority.
- A team that generates most of its xG off the rush needs disciplined neutral-zone positioning more
  than it needs shot-blocking.
- A team with a lot of low-percentage perimeter shots but little slot presence may simply not be a
  major shot-quality threat, freeing you to defend more aggressively elsewhere.

## Step 4: Check Special Teams - But Weight Recent Form

Power play and penalty kill percentages matter for planning your own special-teams matchups and
discipline, but they're volatile in small samples. A team can run hot or cold on special teams over
a handful of games in a way that doesn't reflect their real level. Two adjustments help:

- Look at a longer stretch (a full month, ideally a season) rather than just the last game or two,
  to smooth out the noise.
- Separately note *very recent* form (last 1-2 games) - not to replace the longer-term number, but
  because lineup changes, injuries, or a tactical shift can genuinely move a team's real level
  mid-season, and recent games catch that faster than a season-long average does.

## Step 5: Turn It Into Three Concrete Instructions

The point of all of the above isn't a stat sheet for its own sake - it's to leave practice with a
small number of specific, communicable instructions for the team, for example:

1. "Their top line drives almost all of their offense from the left circle - our matchup line
   collapses there first."
2. "They're winning games but getting outchanced - play our game, don't panic if the score is
   close."
3. "Their penalty kill has been below 70% over the last month - we take the power-play chance if
   it's offered."

That's the actual output of data-driven scouting: not more numbers, but a shorter, more specific
game plan than "watch some film and go with your gut."

---

[Floorball Scanner's F-Liiga tracking](/f-liiga/) computes all of this automatically - team, line,
and player-level xG, shot maps, and special-teams rates for every match - so this kind of
prep takes minutes, not a manual film-and-spreadsheet session. See the
[Floorball Analytics Glossary](/blog/floorball-analytics-glossary-xg-gsax-and-other-kpis/) for a
full rundown of what each number means, or [get started](/get-started) to try it with your own
team.
""",
    },
    {
        'title': 'How to Read a Shot Map: Understanding Shot Quality in Floorball',
        'slug': 'how-to-read-a-shot-map-shot-quality-in-floorball',
        'category': 'analytics-101',
        'excerpt': (
            "A shot map shows where a team's chances come from - and where they let chances "
            "happen against them. Here's how to actually read one."
        ),
        'meta_description': (
            "How to read a floorball shot map: what shot location tells you about chance "
            "quality, common attacking patterns, and how to use it to scout or self-scout."
        ),
        'faq': [
            {
                'question': 'Why do two shot maps with the same number of shots look so different in value?',
                'answer': (
                    "Because shot count alone says nothing about location. Twenty shots "
                    "clustered from bad angles on the perimeter can be worth less, in expected "
                    "goals, than eight shots from the slot. A shot map lets you see that "
                    "difference at a glance; the raw shot count on a scoresheet can't show it "
                    "at all."
                ),
            },
            {
                'question': 'What does a cluster of shots right in front of the net mean?',
                'answer': (
                    "It usually means a team is winning the net-front battle - getting bodies "
                    "and sticks into high-danger space consistently, whether through offensive "
                    "structure, transition speed, or simply outmuscling defenders there. It's "
                    "one of the most repeatable, coachable patterns to look for, on both sides "
                    "of the puck."
                ),
            },
            {
                'question': 'Should I use a shot map for one game or over a season?',
                'answer': (
                    "Both, for different purposes. A single game's shot map is useful for "
                    "postgame review - where did tonight's chances actually come from. A "
                    "season-long shot map is far more reliable for identifying a real, "
                    "repeatable tendency (yours or an opponent's) rather than one night's "
                    "pattern."
                ),
            },
        ],
        'body': """\
> **Key takeaways**
>
> - Shot location is the single biggest driver of shot quality - distance and angle to goal matter
>   more than raw shot count.
> - A cluster of shots near the net usually signals a repeatable offensive (or defensive) strength.
> - Perimeter-heavy shot maps often mean plenty of volume but limited quality.
> - A shot map is most reliable pooled over several games, not read from a single one.

A shot map plots every shot attempt by its location on the rink. On its own it looks like a
scatter of dots - but once you know what to look for, it's one of the fastest ways to understand
*how* a team actually scores (and concedes), not just how many shots it took.

## Why Location Is the Whole Point

Two teams can finish a game with the exact same shot count and have wildly different underlying
performances, because a shot's value depends overwhelmingly on where it was taken from. A shot
from the slot, close to the goal and at a good angle, carries a far higher scoring probability than
a shot from a sharp angle near the boards - even though both register as "one shot" on a
traditional scoresheet.

That's the entire reason expected goals (xG) exists as a metric - see
[What Is Expected Goals (xG) in Floorball?](/blog/what-is-expected-goals-xg-in-floorball/) for the
full explanation - and a shot map is really just the visual version of the same idea: it lets you
*see* where the good chances came from, instead of only seeing the number.

## What to Look For: Clustering Near the Net

The single most useful pattern on a shot map is a dense cluster right in front of the goal. That
usually reflects a real, repeatable strength (or weakness):

- **On offense**, consistent slot presence tends to come from a team's structure - screens,
  net-front positioning, second-chance plays off rebounds - rather than one-off individual plays.
  It's one of the most coachable patterns to build toward.
- **On defense**, a lot of opponent shots clustering right in front of your own net is usually a
  net-front coverage problem worth addressing directly in practice, rather than a goaltending
  problem in disguise.

## What to Look For: Perimeter-Heavy Patterns

The opposite pattern - shots spread wide, from the boards and blue line, with little presence in
the slot - usually means volume without much quality. A team (or a line) generating most of its
shots this way may look active on the scoresheet while actually creating relatively little real
scoring threat, which is exactly the kind of gap a shot map exposes that a shot count alone hides.

Defensively, if you're forcing an opponent into mostly perimeter shots, that's usually a sign your
own structure is working, even on nights the shot total looks high.

## Reading a Shot Map for Your Own Team vs. an Opponent

The same map answers two different, equally useful questions depending on whose shots you're
looking at:

- **Your own shot map** shows whether your offensive structure is actually generating the chances
  you're aiming for, or whether you're generating volume without quality - a direct, visual gut
  check on whether practice time spent on offensive structure is translating into games.
- **An opponent's shot map** shows you where to expect their offense to come from, which turns
  directly into a defensive game plan - see
  [How to Use Match Data to Prepare for Your Next Opponent](/blog/how-to-use-match-data-to-prepare-for-your-next-opponent/)
  for how that fits into a broader scouting routine.

## One Game vs. a Season

A single game's shot map is genuinely useful for postgame review - it's the fastest way to see
where tonight's chances actually came from, good and bad. But for identifying a real, repeatable
tendency (rather than one unusual night), a shot map pooled across several games is far more
reliable. Treat a one-game shot map as a snapshot, and a multi-game one as the pattern.

---

[Floorball Scanner](/f-liiga/) generates a live shot map automatically for every F-Liiga match -
by team and by individual player - alongside the full xG breakdown, so you're reading the pattern
in real time instead of reconstructing it after the fact. [Get started](/get-started) to see it on
your own team's games.
""",
    },
]


class Command(BaseCommand):
    help = "Seeds the first batch of blog posts (see module docstring). Safe to re-run."

    def handle(self, *args, **options):
        for data in POSTS:
            post, created = Post.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'title': data['title'],
                    'category': data['category'],
                    'excerpt': data['excerpt'],
                    'meta_description': data['meta_description'],
                    'body': data['body'],
                    'faq': data['faq'],
                },
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {post.title}"))
