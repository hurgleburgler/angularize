from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from angularize.views import views

# RESTful stuffs
from tastypie.api import Api
#from angularize.api import Resource
from django.conf.urls import include

v1_api = Api(api_name='v1')
#v1_api.register(Resource())

urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    #url(r'^foo$', views.foo, name='foo'),
    url(r'^$', TemplateView.as_view(template_name='index.html')),
)
