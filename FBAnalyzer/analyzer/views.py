"""
Views are rendered to form html - page
views.function returns a HttpResponse - that is the .html file content

"""

from django.shortcuts import redirect, render

from blog.models import Post


def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def signup(request):
    return render(request, 'sign_up.html')

def get_started(request):
    return render(request, 'get_started.html')

def sitemap(request):
    return render(request, 'sitemap.txt')

def robots_txt(request):
    return render(request, 'robots.txt', content_type='text/plain')

def llms_txt(request):
    posts = Post.objects.filter(status='published').order_by('-published_at')
    return render(request, 'llms.txt', {'posts': posts}, content_type='text/plain')

def live(request):
    return render(request, 'live.html')

def game(request, nr):
    return render(request, 'game.html')

def references(request):
    return render(request, 'references.html')

def fliiga_product(request):
    return render(request, 'f-liiga_product.html')

def fliigalive_front(request):
    # This free service ended and moved into the F-Liiga license — send old
    # bookmarks/links straight to its current product page instead of a dead end.
    return redirect('fliiga-product')

def inssidivari_main(request):
    return render(request, 'inssidivari.html')

def inssidivari_results(request):
    return render(request, 'inssidivari_results.html')

def inssidivarigame(request, nr):
    return render(request, 'inssidivari_game.html')

def inssidivarilive(request):
    return render(request, 'inssidivari_live.html')

def testilive(request):
    return render(request, 'testilive.html')

